const { sequelize, CrMwo } = require("../models/wow_cr_mwo");
const { CrMwoMaterialRecord } = require("../models/wow_cr_mwo_material_record");
const { CrMwoServiceRecord } = require("../models/wow_cr_mwo_service_record");
const { MotherMaterialRecord } = require("../models/wow_mwo_material_record");
const { MotherServiceRecord } = require("../models/wow_mwo_service_record");
const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { ChildWorkorder } = require("../models/wow_child_workorder");
const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { Op } = require("sequelize");

// Create a new MWO change request
exports.createMwoChangeRequest = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // Extract data from request body
    const {
      mwo_number,
      total_service_cost,
      total_material_cost,
      cr_status,
      customer_name,
      cr_approver_email,
      cr_approver_name,
      created_by,
      created_at,
      mwo_id,
      materialItems,
      serviceItems,
    } = req.body;

    // Check if there's an existing change request that's not approved
    // Convert mwo_id to string to match the database type (character varying)
    const existingCR = await CrMwo.findOne({
      where: {
        mwo_id: String(mwo_id),
        cr_status: {
          [Op.ne]: "Approved",
        },
      },
    });

    if (existingCR) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "A pending change request already exists for this MWO",
      });
    }

    // Check if CWOs are filled for a higher quantity
    // Get all child workorders for this MWO
    const childWorkorders = await ChildWorkorder.findAll({
      where: { mwo_id: String(mwo_id) },
    });

    // For each material in materialItems, check if CWO quantities exceed the new quantity
    // for (const material of materialItems) {
    //   if (material.is_removed) continue; // Skip removed materials

    //   // Get total quantity used in CWOs
    //   let totalCwoQty = 0;
    //   for (const cwo of childWorkorders) {
    //     const cwoMaterial = await MaterialRecord.findOne({
    //       where: {
    //         cwo_id: cwo.cwo_id,
    //         material_id: material.material_id,
    //       },
    //     });
    //     if (cwoMaterial) {
    //       totalCwoQty += Number(cwoMaterial.material_wo_qty || 0);
    //     }
    //   }

    //   // If new quantity is less than total CWO quantity, return error
    //   if (Number(material.material_cr_qty) < totalCwoQty) {
    //     await t.rollback();
    //     return res.status(400).json({
    //       success: false,
    //       message: `Material ${material.material_id} has CWOs filled for a higher quantity (${totalCwoQty})`,
    //     });
    //   }

    //   // Get the material from the MWO to check available quantity
    //   const mwoMaterial = await MotherMaterialRecord.findOne({
    //     where: {
    //       mwo_id: String(mwo_id),
    //       material_id: material.material_id,
    //     },
    //   });

    //   if (mwoMaterial && !material.is_added) {
    //     // Calculate available quantity in MWO
    //     const mwoQty = Number(mwoMaterial.material_wo_qty || 0);
    //     const availableQty = mwoQty;

    //     // Commented out material quantity check
    //     /*
    //   if (Number(material.material_cr_qty) > availableQty) {
    //     console.log(
    //       `Material ${material.material_id} quantity exceeds available quantity in MWO`
    //     );
    //     console.log(
    //       `MWO qty: ${mwoQty}, Available: ${availableQty}, Requested: ${material.material_cr_qty}`
    //     );

    //     await t.rollback();
    //     return res.status(400).json({
    //       success: false,
    //       message: `Material ${material.material_id} quantity (${material.material_cr_qty}) exceeds available quantity in MWO (${availableQty})`,
    //     });
    //   }
    //   */
    //   }
    // }

    // Similar check for services
    for (const service of serviceItems) {
      if (service.is_removed) continue; // Skip removed services

      // Get total quantity used in CWOs
      let totalCwoQty = 0;
      // for (const cwo of childWorkorders) {
      //   const cwoService = await ServiceRecord.findOne({
      //     where: {
      //       cwo_id: cwo.cwo_id,
      //       service_id: service.service_id,
      //     },
      //   });
      //   if (cwoService) {
      //     totalCwoQty += Number(cwoService.service_wo_qty || 0);
      //   }
      // }

      // If new quantity is less than total CWO quantity, return error
      // if (Number(service.service_cr_qty) < totalCwoQty) {
      //   await t.rollback();
      //   return res.status(400).json({
      //     success: false,
      //     message: `Service ${service.service_id} has CWOs filled for a higher quantity (${totalCwoQty})`,
      //   });
      // }

      // Get the service from the MWO to check available quantity
      const mwoService = await MotherServiceRecord.findOne({
        where: {
          mwo_id: String(mwo_id),
          service_id: service.service_id,
        },
      });

      if (mwoService && !service.is_added) {
        // Calculate available quantity in MWO
        const mwoQty = Number(mwoService.service_wo_qty || 0);
        const availableQty = mwoQty;

        // Commented out service quantity check
        /*
      if (Number(service.service_cr_qty) > availableQty) {
        console.log(
          `Service ${service.service_id} quantity exceeds available quantity in MWO`
        );
        console.log(
          `MWO qty: ${mwoQty}, Available: ${availableQty}, Requested: ${service.service_cr_qty}`
        );

        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Service ${service.service_id} quantity (${service.service_cr_qty}) exceeds available quantity in MWO (${availableQty})`,
        });
      }
      */
      }
    }

    // Set initial status to "Pending for approval X" (first approver)
    const initialStatus = "Pending for approval X";

    // Create the change request with the 3-approver workflow structure
    const newChangeRequest = await CrMwo.create(
      {
        mwo_number,
        total_service_cost,
        total_material_cost,
        cr_status: initialStatus,
        customer_name,
        cr_approver_email, // First approver
        cr_approver_name,
        cr_approver2_email: null, // Second approver (will be set when first approver approves)
        cr_approver2_name: null,
        cr_approver3_email: null, // Third approver (will be set when second approver approves)
        cr_approver3_name: null,
        created_by,
        created_at,
        mwo_id,
      },
      { transaction: t }
    );

    // Get the generated cr_mwo_id
    const cr_id = newChangeRequest.cr_mwo_id;

    // Add materials to the database
    if (materialItems && materialItems.length > 0) {
      const materialRecords = materialItems.map((material, index) => ({
        ...material,
        cr_id: cr_id,
        // Generate a unique record_id using cr_id, material_id and timestamp
        record_id: `${cr_id}_${material.material_id}_${Date.now()}_${index}`,
      }));

      await CrMwoMaterialRecord.bulkCreate(materialRecords, { transaction: t });
    }

    // Add services to the database
    if (serviceItems && serviceItems.length > 0) {
      const serviceRecords = serviceItems.map((service, index) => ({
        ...service,
        cr_id: cr_id,
        // Generate a unique record_id using cr_id, service_id and timestamp
        record_id: `${cr_id}_${service.service_id}_${Date.now()}_${index}`,
      }));

      await CrMwoServiceRecord.bulkCreate(serviceRecords, { transaction: t });
    }

    // Commit the transaction
    await t.commit();

    res.status(201).json({
      success: true,
      message: "MWO change request created successfully",
      data: {
        cr_id,
        mwo_number,
        cr_status: initialStatus,
      },
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await t.rollback();
    console.error("Error creating MWO change request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create MWO change request",
      error: error.message,
    });
  }
};

// Get MWO change requests by various filters
exports.getMwoChangeRequests = async (req, res) => {
  try {
    const {
      cr_id,
      mwo_number,
      cr_status,
      customer_name,
      cr_approver_email,
      created_by,
      mwo_id,
    } = req.query;

    // Build the where clause based on provided filters
    const whereClause = {};

    if (cr_id) whereClause.cr_mwo_id = cr_id;
    if (mwo_number) whereClause.mwo_number = mwo_number;
    if (cr_status) whereClause.cr_status = cr_status;
    if (customer_name) whereClause.customer_name = customer_name;
    if (cr_approver_email) whereClause.cr_approver_email = cr_approver_email;
    if (created_by) whereClause.created_by = created_by;
    if (mwo_id) whereClause.mwo_id = String(mwo_id);

    // Find change requests based on filters
    const changeRequests = await CrMwo.findAll({
      where: whereClause,
      order: [["cr_mwo_id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: changeRequests.length,
      data: changeRequests,
    });
  } catch (error) {
    console.error("Error fetching MWO change requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch MWO change requests",
      error: error.message,
    });
  }
};

// Get materials for a specific MWO change request
exports.getMwoChangeRequestMaterials = async (req, res) => {
  try {
    const { cr_id } = req.params;

    const materials = await CrMwoMaterialRecord.findAll({
      where: { cr_id },
    });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    console.error("Error fetching MWO change request materials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch MWO change request materials",
      error: error.message,
    });
  }
};

// Get services for a specific MWO change request
exports.getMwoChangeRequestServices = async (req, res) => {
  try {
    const { cr_id } = req.params;

    const services = await CrMwoServiceRecord.findAll({
      where: { cr_id },
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching MWO change request services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch MWO change request services",
      error: error.message,
    });
  }
};

// Update MWO change request status
exports.updateMwoChangeRequestStatus = async (req, res) => {
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
    const changeRequest = await CrMwo.findByPk(cr_id);

    if (!changeRequest) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "MWO change request not found",
      });
    }

    // Determine the approver level based on the current status
    // First approver: status is "Pending for approval X"
    const isFirstApprover =
      changeRequest.cr_status === "Pending for approval X";

    // Second approver: status is "Pending for approval Y"
    const isSecondApprover =
      changeRequest.cr_status === "Pending for approval Y";

    // Third approver: status is "Pending for approval Z"
    const isThirdApprover =
      changeRequest.cr_status === "Pending for approval Z";

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

        newStatus = "Pending for approval Y";
        updateData.cr_approver2_email = cr_approver2_email;
        updateData.cr_approver2_name = cr_approver2_name;
      } else if (isSecondApprover) {
        // Second approver approved, add third approver info and update status
        const { cr_approver3_email, cr_approver3_name } = req.body;

        if (!cr_approver3_email || !cr_approver3_name) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: "Third approver information is required",
          });
        }

        newStatus = "Pending for approval Z";
        updateData.cr_approver3_email = cr_approver3_email;
        updateData.cr_approver3_name = cr_approver3_name;
      } else if (isThirdApprover) {
        // Third approver approved, final approval
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
      } else if (isThirdApprover) {
        newStatus = `Rejected by ${changeRequest.cr_approver3_name}`;
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

    // If the change request is fully approved (final approval), update the MWO material and service records
    if (newStatus === "Approved") {
      // Get the MWO ID from the change request
      const mwo_id = changeRequest.mwo_id;

      // Get all materials for this change request
      const crMaterials = await CrMwoMaterialRecord.findAll({
        where: { cr_id },
        transaction: t,
      });

      // Get all services for this change request
      const crServices = await CrMwoServiceRecord.findAll({
        where: { cr_id },
        transaction: t,
      });

      // Process material changes
      for (const material of crMaterials) {
        if (material.is_removed) {
          // If material is marked for removal, delete it from MWO materials

          try {
            const deleteResult = await MotherMaterialRecord.destroy({
              where: {
                material_id: material.material_id,
                mwo_id: mwo_id,
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
          // Check if this material already exists in the MWO
          const existingMaterial = await MotherMaterialRecord.findOne({
            where: {
              material_id: material.material_id,
              mwo_id: mwo_id,
            },
            transaction: t,
          });

          if (existingMaterial) {
            // If material exists, update its quantity and price

            try {
              await existingMaterial.update(
                {
                  material_wo_qty: material.material_cr_qty,
                  material_price: material.cr_amount,
                  material_bal_qty: material.material_cr_qty, // Update balance qty as well
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
          } else if (material.is_added) {
            // If material doesn't exist and is marked as added, create it

            try {
              await MotherMaterialRecord.create(
                {
                  record_id: `${mwo_id}_${material.material_id}`,
                  mwo_id: mwo_id,
                  mwo_number: material.mwo_number,
                  material_id: material.material_id,
                  material_desc: material.material_desc,
                  material_uom: material.material_uom,
                  material_wo_qty: material.material_cr_qty,
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
          // If service is marked for removal, delete it from MWO services
          try {
            const deleteResult = await MotherServiceRecord.destroy({
              where: {
                service_id: service.service_id,
                mwo_id: mwo_id,
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
          // Check if this service already exists in the MWO
          const existingService = await MotherServiceRecord.findOne({
            where: {
              service_id: service.service_id,
              mwo_id: mwo_id,
            },
            transaction: t,
          });

          if (existingService) {
            // If service exists, update its quantity and price

            try {
              await existingService.update(
                {
                  service_wo_qty: service.service_cr_qty,
                  service_price: service.cr_amount,
                  service_bal_qty: service.service_cr_qty, // Update balance qty as well
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
          } else if (service.is_added) {
            // If service doesn't exist and is marked as added, create it

            try {
              await MotherServiceRecord.create(
                {
                  record_id: `${mwo_id}_${service.service_id}`,
                  mwo_id: mwo_id,
                  mwo_number: service.mwo_number,
                  service_id: service.service_id,
                  service_desc: service.service_desc,
                  service_uom: service.service_uom,
                  service_wo_qty: service.service_cr_qty,
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

      // Calculate new total costs for the MWO
      let totalMaterialCost = 0;
      let totalServiceCost = 0;

      // Calculate total material cost
      const allMaterials = await MotherMaterialRecord.findAll({
        where: { mwo_id: mwo_id },
        transaction: t,
      });

      for (const material of allMaterials) {
        const materialPrice = Number(material.material_price || 0);
        totalMaterialCost += materialPrice;
      }

      // Calculate total service cost
      const allServices = await MotherServiceRecord.findAll({
        where: { mwo_id: mwo_id },
        transaction: t,
      });

      for (const service of allServices) {
        const servicePrice = Number(service.service_price || 0);
        totalServiceCost += servicePrice;
      }

      // Update the MWO with new total costs
      try {
        const updateResult = await MotherWorkorder.update(
          {
            total_material_cost: totalMaterialCost.toFixed(2),
            total_service_cost: totalServiceCost.toFixed(2),
          },
          {
            where: { mwo_id: mwo_id },
            transaction: t,
          }
        );
      } catch (error) {
        console.error(`Error updating MWO ${mwo_id} totals:`, error);
        throw error; // Re-throw to trigger transaction rollback
      }
    }

    await t.commit();

    res.status(200).json({
      success: true,
      message: "MWO change request status updated successfully",
      data: {
        cr_id,
        cr_status: newStatus,
        actioned_by: changeRequest.actioned_by,
        actioned_at: changeRequest.actioned_at,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating MWO change request status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update MWO change request status",
      error: error.message,
    });
  }
};
