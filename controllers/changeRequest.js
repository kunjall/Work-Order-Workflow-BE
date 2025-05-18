const { sequelize, CrCwo } = require("../models/wow_cr_cwo");
const { CrCwoMaterialRecord } = require("../models/wow_cr_cwo_material_record");
const { CrCwoServiceRecord } = require("../models/wow_cr_cwo_service_record");
const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { ChildWorkorder } = require("../models/wow_child_workorder");
const { MotherMaterialRecord } = require("../models/wow_mwo_material_record");
const { MotherServiceRecord } = require("../models/wow_mwo_service_record");
const { Op } = require("sequelize");

// Create a new change request
exports.createChangeRequest = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // Extract data from request body
    const {
      cwo_number,
      total_service_cost,
      total_material_cost,
      cr_status,
      customer_name,
      cr_approver_email,
      cr_approver_name,
      created_by,
      created_at,
      cwo_id,
      materialItems,
      serviceItems,
    } = req.body;

    // Check if there's an existing change request that's not approved
    const existingCR = await CrCwo.findOne({
      where: {
        cwo_id: cwo_id,
        cr_status: {
          [Op.ne]: "Approved",
        },
      },
    });

    if (existingCR) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "A pending change request already exists for this CWO",
      });
    }

    // Get the CWO details to retrieve mwo_id
    const childWorkorder = await ChildWorkorder.findOne({
      where: { cwo_id: cwo_id },
    });

    if (!childWorkorder) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Child workorder not found",
      });
    }

    const mwo_id = childWorkorder.mwo_id;

    // Check if the quantities in the change request are valid
    // For each material in materialItems, check if the quantity is valid
    for (const material of materialItems) {
      if (material.is_removed) continue; // Skip removed materials

      // Get the material from the MWO
      const mwoMaterial = await MotherMaterialRecord.findOne({
        where: {
          mwo_id: String(mwo_id),
          material_id: material.material_id,
        },
      });

      if (mwoMaterial) {
        // Get total quantity used in other CWOs
        let totalOtherCwoQty = 0;
        const otherCwos = await ChildWorkorder.findAll({
          where: {
            mwo_id: String(mwo_id),
            cwo_id: {
              [Op.ne]: cwo_id, // Exclude the current CWO
            },
          },
        });

        for (const otherCwo of otherCwos) {
          const otherCwoMaterial = await MaterialRecord.findOne({
            where: {
              cwo_id: otherCwo.cwo_id,
              material_id: material.material_id,
            },
          });
          if (otherCwoMaterial) {
            totalOtherCwoQty += Number(otherCwoMaterial.material_wo_qty || 0);
          }
        }

        // Calculate available quantity in MWO
        const mwoQty = Number(mwoMaterial.material_wo_qty || 0);
        const availableQty = mwoQty - totalOtherCwoQty;

        // If new quantity is greater than available quantity, return error
        if (Number(material.material_cr_qty) > availableQty) {
          console.log(
            `Material ${material.material_id} quantity exceeds available quantity in MWO`
          );
          console.log(
            `MWO qty: ${mwoQty}, Total other CWO qty: ${totalOtherCwoQty}, Available: ${availableQty}, Requested: ${material.material_cr_qty}`
          );

          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Material ${material.material_id} quantity (${material.material_cr_qty}) exceeds available quantity in MWO (${availableQty})`,
          });
        }
      }
    }

    // Similar check for services
    for (const service of serviceItems) {
      if (service.is_removed) continue; // Skip removed services

      // Get the service from the MWO
      const mwoService = await MotherServiceRecord.findOne({
        where: {
          mwo_id: String(mwo_id),
          service_id: service.service_id,
        },
      });

      if (mwoService) {
        // Get total quantity used in other CWOs
        let totalOtherCwoQty = 0;
        const otherCwos = await ChildWorkorder.findAll({
          where: {
            mwo_id: String(mwo_id),
            cwo_id: {
              [Op.ne]: cwo_id, // Exclude the current CWO
            },
          },
        });

        for (const otherCwo of otherCwos) {
          const otherCwoService = await ServiceRecord.findOne({
            where: {
              cwo_id: otherCwo.cwo_id,
              service_id: service.service_id,
            },
          });
          if (otherCwoService) {
            totalOtherCwoQty += Number(otherCwoService.service_wo_qty || 0);
          }
        }

        // Calculate available quantity in MWO
        const mwoQty = Number(mwoService.service_wo_qty || 0);
        const availableQty = mwoQty - totalOtherCwoQty;

        // If new quantity is greater than available quantity, return error
        if (Number(service.service_cr_qty) > availableQty) {
          console.log(
            `Service ${service.service_id} quantity exceeds available quantity in MWO`
          );
          console.log(
            `MWO qty: ${mwoQty}, Total other CWO qty: ${totalOtherCwoQty}, Available: ${availableQty}, Requested: ${service.service_cr_qty}`
          );

          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Service ${service.service_id} quantity (${service.service_cr_qty}) exceeds available quantity in MWO (${availableQty})`,
          });
        }
      }
    }

    // Set initial status to "Pending for approval X"
    const initialStatus = `Pending for approval X`;

    // Create the change request
    const newChangeRequest = await CrCwo.create(
      {
        cwo_number,
        total_service_cost,
        total_material_cost,
        cr_status: initialStatus, // Override the status with our formatted version
        customer_name,
        cr_approver_email,
        cr_approver_name,
        created_by,
        created_at,
        cwo_id,
      },
      { transaction: t }
    );

    // Get the generated cr_cwo_id
    const cr_id = newChangeRequest.cr_cwo_id;

    // Add materials to the database
    if (materialItems && materialItems.length > 0) {
      const materialRecords = materialItems.map((material, index) => ({
        ...material,
        cr_id: cr_id,
        // Generate a unique record_id using cr_id, material_id and timestamp
        record_id: `${cr_id}_${material.material_id}_${Date.now()}_${index}`,
      }));

      await CrCwoMaterialRecord.bulkCreate(materialRecords, { transaction: t });
    }

    // Add services to the database
    if (serviceItems && serviceItems.length > 0) {
      const serviceRecords = serviceItems.map((service, index) => ({
        ...service,
        cr_id: cr_id,
        // Generate a unique record_id using cr_id, service_id and timestamp
        record_id: `${cr_id}_${service.service_id}_${Date.now()}_${index}`,
      }));

      await CrCwoServiceRecord.bulkCreate(serviceRecords, { transaction: t });
    }

    // Commit the transaction
    await t.commit();

    res.status(201).json({
      success: true,
      message: "Change request created successfully",
      data: {
        cr_id,
        cwo_number,
        cr_status,
      },
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await t.rollback();
    console.error("Error creating change request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create change request",
      error: error.message,
    });
  }
};

// Get change requests by various filters
exports.getChangeRequests = async (req, res) => {
  try {
    const {
      cr_id,
      cwo_number,
      cr_status,
      customer_name,
      cr_approver_email,
      created_by,
      cwo_id,
    } = req.query;

    // Build the where clause based on provided filters
    const whereClause = {};

    if (cr_id) whereClause.cr_cwo_id = cr_id;
    if (cwo_number) whereClause.cwo_number = cwo_number;
    if (cr_status) whereClause.cr_status = cr_status;
    if (customer_name) whereClause.customer_name = customer_name;
    if (cr_approver_email) whereClause.cr_approver_email = cr_approver_email;
    if (created_by) whereClause.created_by = created_by;
    if (cwo_id) whereClause.cwo_id = cwo_id;

    // Find change requests based on filters
    const changeRequests = await CrCwo.findAll({
      where: whereClause,
      order: [["cr_cwo_id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: changeRequests.length,
      data: changeRequests,
    });
  } catch (error) {
    console.error("Error fetching change requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch change requests",
      error: error.message,
    });
  }
};

// Get materials for a specific change request
exports.getChangeRequestMaterials = async (req, res) => {
  try {
    const { cr_id } = req.params;

    const materials = await CrCwoMaterialRecord.findAll({
      where: { cr_id },
    });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    console.error("Error fetching change request materials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch change request materials",
      error: error.message,
    });
  }
};

// Get services for a specific change request
exports.getChangeRequestServices = async (req, res) => {
  try {
    const { cr_id } = req.params;

    const services = await CrCwoServiceRecord.findAll({
      where: { cr_id },
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching change request services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch change request services",
      error: error.message,
    });
  }
};

// Update change request status
exports.updateChangeRequestStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { cr_id } = req.params;
    const {
      cr_status,
      actioned_by,
      actioned_at,
      approver_comments,
      cr_approver2_email,
      cr_approver2_name,
    } = req.body;

    // Find the change request
    const changeRequest = await CrCwo.findByPk(cr_id);

    if (!changeRequest) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Change request not found",
      });
    }

    // Determine if this is the first or second approver based on the current status
    // First approver: status is "Pending for approval X"
    const isFirstApprover =
      changeRequest.cr_status === "Pending for approval X";

    // Second approver: status is "Pending for approval Y"
    const isSecondApprover =
      changeRequest.cr_status === "Pending for approval Y";

    let newStatus;
    let updateData = {
      actioned_by: actioned_by || changeRequest.actioned_by,
      actioned_at: actioned_at || changeRequest.actioned_at,
      approver_comments: approver_comments || changeRequest.approver_comments,
    };

    if (cr_status === "Approved") {
      if (isFirstApprover) {
        // First approver approved, add second approver info and update status
        if (!cr_approver2_email || !cr_approver2_name) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: "Second approver information is required",
          });
        }

        newStatus = `Pending for approval Y`;
        updateData.cr_approver2_email = cr_approver2_email;
        updateData.cr_approver2_name = cr_approver2_name;
      } else if (isSecondApprover) {
        // Second approver approved, final approval
        newStatus = "Approved";
      } else {
        // Status doesn't match expected pattern, use provided status
        newStatus = cr_status;
      }
    } else if (cr_status === "Rejected") {
      // Determine who rejected
      if (isFirstApprover) {
        newStatus = `Rejected by ${changeRequest.cr_approver_name}`;
      } else if (isSecondApprover) {
        newStatus = `Rejected by ${changeRequest.cr_approver2_name}`;
      } else {
        newStatus = "Rejected";
      }
    } else {
      // Keep the status as is for any other action
      newStatus = cr_status;
    }

    // Add the new status to the update data
    updateData.cr_status = newStatus;

    // Update the change request
    await changeRequest.update(updateData, { transaction: t });

    // If the change request is fully approved (final approval), update the CWO material and service records
    if (newStatus === "Approved") {
      // Get the CWO ID from the change request
      const cwo_id = changeRequest.cwo_id;

      // Get the CWO details to retrieve mwo_id, mwo_number, and vendor_id
      const childWorkorder = await ChildWorkorder.findOne({
        where: { cwo_id: cwo_id },
        transaction: t,
      });

      if (!childWorkorder) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: "Child workorder not found",
        });
      }

      const mwo_id = childWorkorder.mwo_id;
      const mwo_number = childWorkorder.mwo_number;
      const vendor_id = childWorkorder.vendor_id;

      // Get all materials for this change request
      const crMaterials = await CrCwoMaterialRecord.findAll({
        where: { cr_id },
        transaction: t,
      });

      // Get all services for this change request
      const crServices = await CrCwoServiceRecord.findAll({
        where: { cr_id },
        transaction: t,
      });

      // Process material changes
      for (const material of crMaterials) {
        if (material.is_removed) {
          // If material is marked for removal, delete it from CWO materials

          try {
            const deleteResult = await MaterialRecord.destroy({
              where: {
                material_id: material.material_id,
                cwo_id: cwo_id,
              },
              transaction: t,
            });
          } catch (error) {
            console.error(
              `Error deleting material ${material.material_id}:`,
              error
            );
            throw error; // Re-throw to trigger transaction rollback
          }
        } else {
          // Check if this material already exists in the CWO
          const existingMaterial = await MaterialRecord.findOne({
            where: {
              material_id: material.material_id,
              cwo_id: cwo_id,
            },
            transaction: t,
          });

          if (existingMaterial) {
            // If material exists, update its quantity, price, and balance
            const newWoQty = Number(material.material_cr_qty);
            const currentMbQty = Number(existingMaterial.material_mb_qty || 0);
            const newBalQty = Math.max(0, newWoQty - currentMbQty);

            try {
              await existingMaterial.update(
                {
                  material_wo_qty: newWoQty,
                  material_price: material.cr_amount,
                  material_bal_qty: newBalQty,
                },
                { transaction: t }
              );
            } catch (error) {
              console.error(
                `Error updating material ${material.material_id}:`,
                error
              );
              throw error; // Re-throw to trigger transaction rollback
            }
          } else {
            // If material doesn't exist, it's a new addition - create it

            try {
              await MaterialRecord.create(
                {
                  record_id: `${cwo_id}_${material.material_id}`,
                  cwo_id: cwo_id,
                  cwo_number: material.cwo_number,
                  mwo_id: mwo_id, // Add mwo_id from CWO
                  mwo_number: mwo_number, // Add mwo_number from CWO
                  vendor_id: vendor_id, // Add vendor_id from CWO
                  material_id: material.material_id,
                  material_desc: material.material_desc,
                  material_uom: material.material_uom,
                  material_wo_qty: material.material_cr_qty,
                  material_mb_qty: 0, // Initialize with 0
                  material_bal_qty: material.material_cr_qty, // Balance is same as WO qty initially
                  material_rate: material.material_unit_price,
                  material_price: material.cr_amount,
                },
                { transaction: t }
              );
            } catch (error) {
              console.error(
                `Error creating new material ${material.material_id}:`,
                error
              );
              throw error; // Re-throw to trigger transaction rollback
            }
          }
        }
      }

      // Process service changes
      for (const service of crServices) {
        if (service.is_removed) {
          // If service is marked for removal, delete it from CWO services

          try {
            const deleteResult = await ServiceRecord.destroy({
              where: {
                service_id: service.service_id,
                cwo_id: cwo_id,
              },
              transaction: t,
            });
          } catch (error) {
            console.error(
              `Error deleting service ${service.service_id}:`,
              error
            );
            throw error; // Re-throw to trigger transaction rollback
          }
        } else {
          // Check if this service already exists in the CWO
          const existingService = await ServiceRecord.findOne({
            where: {
              service_id: service.service_id,
              cwo_id: cwo_id,
            },
            transaction: t,
          });

          if (existingService) {
            // If service exists, update its quantity, price, and balance
            const newWoQty = Number(service.service_cr_qty);
            const currentMbQty = Number(existingService.service_mb_qty || 0);
            const newBalQty = Math.max(0, newWoQty - currentMbQty);

            try {
              await existingService.update(
                {
                  service_wo_qty: newWoQty,
                  service_price: service.cr_amount,
                  service_bal_qty: newBalQty,
                },
                { transaction: t }
              );
            } catch (error) {
              console.error(
                `Error updating service ${service.service_id}:`,
                error
              );
              throw error; // Re-throw to trigger transaction rollback
            }
          } else {
            // If service doesn't exist, it's a new addition - create it

            try {
              await ServiceRecord.create(
                {
                  record_id: `${cwo_id}_${service.service_id}`,
                  cwo_id: cwo_id,
                  cwo_number: service.cwo_number,
                  mwo_id: mwo_id, // Add mwo_id from CWO
                  mwo_number: mwo_number, // Add mwo_number from CWO
                  vendor_id: vendor_id, // Add vendor_id from CWO
                  service_id: service.service_id,
                  service_desc: service.service_desc,
                  service_uom: service.service_uom,
                  service_wo_qty: service.service_cr_qty,
                  service_mb_qty: 0, // Initialize with 0
                  service_bal_qty: service.service_cr_qty, // Balance is same as WO qty initially
                  service_rate: service.service_unit_price,
                  service_price: service.cr_amount,
                },
                { transaction: t }
              );
            } catch (error) {
              console.error(
                `Error creating new service ${service.service_id}:`,
                error
              );
              throw error; // Re-throw to trigger transaction rollback
            }
          }
        }
      }

      // Calculate new total costs for the CWO
      let totalMaterialCost = 0;
      let totalServiceCost = 0;

      // Calculate total material cost
      const allMaterials = await MaterialRecord.findAll({
        where: { cwo_id: cwo_id },
        transaction: t,
      });

      for (const material of allMaterials) {
        const materialPrice = Number(material.material_price || 0);
        totalMaterialCost += materialPrice;
      }

      // Calculate total service cost
      const allServices = await ServiceRecord.findAll({
        where: { cwo_id: cwo_id },
        transaction: t,
      });

      for (const service of allServices) {
        const servicePrice = Number(service.service_price || 0);
        totalServiceCost += servicePrice;
      }

      // Update the CWO with new total costs
      try {
        const updateResult = await ChildWorkorder.update(
          {
            total_material_cost: totalMaterialCost.toFixed(2),
            total_service_cost: totalServiceCost.toFixed(2),
          },
          {
            where: { cwo_id: cwo_id },
            transaction: t,
          }
        );
      } catch (error) {
        console.error(`Error updating CWO ${cwo_id} totals:`, error);
        throw error; // Re-throw to trigger transaction rollback
      }
    }

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Change request status updated successfully",
      data: {
        cr_id,
        cr_status: newStatus,
        actioned_by: changeRequest.actioned_by,
        actioned_at: changeRequest.actioned_at,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating change request status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update change request status",
      error: error.message,
    });
  }
};
