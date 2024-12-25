const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { ChildWorkorder } = require("../models/wow_child_workorder");
const { MotherMaterialRecord } = require("../models/wow_mwo_material_record");
const { MotherServiceRecord } = require("../models/wow_mwo_service_record");
const { sequelize } = require("../utils/db");
const { Op } = require("sequelize");

const createMotherWorkorder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      mwo_number,
      workorder_type,
      mwo_status,
      gis_code,
      route_name,
      route_length,
      homepass_count,
      activity,
      type,
      customer_id,
      execution_city,
      customer_project_manager,
      customer_name,
      customer_state,
      customer_approval_date,
      created_by,
      created_at,
      total_service_cost,
      mwo_approver_email,
      mwo_approver_name,
      total_material_cost,
      materialRecords, // Array of material records
      serviceRecords, // Array of service records
    } = req.body;

    // Validate required fields
    if (
      !mwo_number ||
      !workorder_type ||
      !mwo_status ||
      !gis_code ||
      !route_name ||
      !route_length ||
      !homepass_count ||
      !activity ||
      !type ||
      !customer_id ||
      !customer_project_manager ||
      !customer_name ||
      !customer_state ||
      !execution_city ||
      !customer_approval_date
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Step 1: Create the workorder
    const newWorkorder = await MotherWorkorder.create(
      {
        mwo_number,
        workorder_type,
        mwo_status,
        gis_code,
        route_name,
        route_length,
        homepass_count,
        activity,
        type,
        customer_id,
        execution_city,
        customer_project_manager,
        mwo_approver_email,
        mwo_approver_name,
        customer_name,
        customer_state,
        customer_approval_date,
        created_by,
        created_at,
        total_service_cost,
        total_material_cost,
      },
      { transaction }
    );

    // Step 2: Insert material records
    console.log(materialRecords);
    console.log(serviceRecords);
    if (materialRecords && materialRecords.length > 0) {
      for (const material of materialRecords) {
        await MotherMaterialRecord.create(
          {
            record_id: `${mwo_number}_${material.materialCode}`,
            mwo_number,
            material_id: material.materialCode,
            material_desc: material.itemName,
            material_uom: material.itemUom,
            material_wo_qty: material.itemQTY,
            material_bal_qty: material.itemQTY,
            mwo_id: newWorkorder.mwo_id,
            material_rate: material.itemRate,
            material_price: material.itemPrice,
          },
          { transaction }
        );
      }
    }

    // Step 3: Insert service records
    if (serviceRecords && serviceRecords.length > 0) {
      for (const service of serviceRecords) {
        await MotherServiceRecord.create(
          {
            record_id: `${mwo_number}_${service.serviceId}`,
            mwo_number,
            service_id: service.serviceId,
            service_desc: service.serviceDescription,
            service_uom: service.serviceUOM,
            service_rate: service.serviceRate,
            service_wo_qty: service.serviceQTY,
            service_bal_qty: service.serviceQTY,
            service_price: service.servicePrice,
            mwo_id: newWorkorder.mwo_id,
          },
          { transaction }
        );
      }
    }

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Workorder, material, and service records created successfully",
      workorderId: newWorkorder.mwo_id,
    });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();

    console.error("Error during transaction:", error);
    res.status(500).json({
      message: "Failed to create workorder and related records",
      error: error.message,
    });
  }
};

const findWorkorder = async (req, res) => {
  try {
    const foundWorkorder = await MotherWorkorder.findAll({
      where: { mwo_status: "Approved" },
    });
    res.json(foundWorkorder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findChildWorkorder = async (req, res) => {
  try {
    const foundChildWorkorder = await ChildWorkorder.findAll();
    res.json(foundChildWorkorder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createChildWorkorder = async (req, res) => {
  const {
    mwo_id,
    mwo_number,
    vendor_id,
    vendor_route_allocation,
    total_service_cost,
    internal_manager,
    execution_city,
    workorder_type,
    cwo_number,
    total_material_cost,
    materialItems,
    serviceItems,
    cwo_status,
    customer_name,
    cwo_approver_email,
    cwo_approver_name,
    created_at,
    created_by,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Create the child work order
    const createdWorkOrder = await ChildWorkorder.create(
      {
        mwo_id,
        mwo_number,
        vendor_id,
        vendor_route_allocation,
        total_service_cost,
        internal_manager,
        execution_city,
        workorder_type,
        cwo_number,
        total_material_cost,
        cwo_status,
        customer_name,
        cwo_approver_email,
        cwo_approver_name,
        created_at,
        created_by,
      },
      { transaction }
    );

    // Process material items
    console.log(materialItems);
    console.log(serviceItems);
    if (materialItems && materialItems.length > 0) {
      for (const material of materialItems) {
        await MaterialRecord.create(
          {
            record_id: `${cwo_number}_${material.material_id}`,
            mwo_number,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_wo_qty: material.cwo_qty,
            material_bal_qty: material.cwo_qty,
            vendor_id,
            cwo_id: createdWorkOrder.cwo_id,
            cwo_number,
            material_rate: material.material_rate,
            material_price: material.material_cwo_price,
          },
          { transaction }
        );

        const materialRecord = await MotherMaterialRecord.findOne({
          where: { record_id: material.material_record_id },
          transaction,
        });

        if (!materialRecord) {
          throw new Error(
            `Material record not found for record ID: ${material.material_record_id}`
          );
        }

        const newMaterialBalQty =
          materialRecord.material_bal_qty - material.cwo_qty;

        if (newMaterialBalQty < 0) {
          throw new Error(
            `Insufficient balance for material record ID: ${material.material_record_id}`
          );
        }

        await MotherMaterialRecord.update(
          { material_bal_qty: newMaterialBalQty },
          { where: { record_id: material.material_record_id }, transaction }
        );
      }
    }

    // Process service items
    if (serviceItems && serviceItems.length > 0) {
      for (const service of serviceItems) {
        await ServiceRecord.create(
          {
            record_id: `${cwo_number}_${service.service_id}`,
            mwo_number,
            service_id: service.service_id,
            service_desc: service.service_desc,
            service_uom: service.service_uom,
            service_wo_qty: service.cwo_qty,
            service_bal_qty: service.cwo_qty,
            service_price: service.service_cwo_price,
            service_rate: service.service_rate,
            vendor_id,
            cwo_id: createdWorkOrder.cwo_id,
            cwo_number,
          },
          { transaction }
        );

        const serviceRecord = await MotherServiceRecord.findOne({
          where: { record_id: service.service_record_id },
          transaction,
        });

        if (!serviceRecord) {
          throw new Error(
            `Service record not found for record ID: ${service.service_record_id}`
          );
        }

        const newServiceBalQty =
          serviceRecord.service_bal_qty - service.cwo_qty;

        if (newServiceBalQty < 0) {
          throw new Error(
            `Insufficient balance for service record ID: ${service.service_record_id}`
          );
        }

        await MotherServiceRecord.update(
          { service_bal_qty: newServiceBalQty },
          { where: { record_id: service.service_record_id }, transaction }
        );
      }
    }

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Work Order and related data created successfully",
    });
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();

    // Determine error type
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("Insufficient balance")) {
      res.status(400).json({ error: error.message });
    } else {
      console.error("Transaction failed:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

const getMwoActions = async (req, res) => {
  try {
    const user = req.query.user;
    const mwostatus = req.query.mwostatus;

    // Input validation
    if (!user || !mwostatus) {
      return res
        .status(400)
        .json({ message: "User and mwo status are required." });
    }

    // Define filter conditions based on inventory status
    const whereCondition = {
      mwo_status: mwostatus,
      [Op.or]: [{ mwo_approver_email: user }, { created_by: user }],
    };

    // Fetch inventory data
    const foundMwo = await MotherWorkorder.findAll({
      where: whereCondition,
    });

    // Return the data
    if (!foundMwo || foundMwo.length === 0) {
      return res.status(200).json({ message: "No MWO found." });
    }

    res.status(200).json(foundMwo);
  } catch (error) {
    console.error("Error fetching mwo:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const findMotherServices = async (req, res) => {
  try {
    const { mwo_id } = req.query; // Extract mwo_number from the query
    if (!mwo_id) {
      return res.status(400).json({ message: "mwo id is required." });
    }
    const foundMwoService = await MotherServiceRecord.findAll({
      where: { mwo_id: mwo_id },
      // Filter based on mwo_number
    });
    if (foundMwoService.length === 0) {
      return res.status(200).json({ message: "No service records found." });
    }

    res.json(foundMwoService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findMotherMaterials = async (req, res) => {
  try {
    const { mwo_id } = req.query;
    if (!mwo_id) {
      return res.status(400).json({ message: "mwo id is required." });
    }
    const foundMotherMaterials = await MotherMaterialRecord.findAll({
      where: { mwo_id: mwo_id }, // Filter based on mwo_number
    });

    if (foundMotherMaterials.length === 0) {
      return res.status(200).json({ message: "No material records found." });
    }

    res.json(foundMotherMaterials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const getMwoMaterialActions = async (req, res) => {
//   try {
//     const mwo_id = req.query.mwo_id;

//     // Input validation
//     if (!mwo_id) {
//       return res.status(400).json({ message: "mwo id is required." });
//     }
//     const foundMwoMaterial = await MotherMaterialRecord.findAll({
//       where: {
//         mwo_id: mwo_id,
//       },
//     });

//     if (foundMwoMaterial.length === 0) {
//       return res.status(200).json({ message: "No material records found." });
//     }

//     res.json(foundMwoMaterial);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const getMwoServiceActions = async (req, res) => {
//   try {
//     const mwo_id = req.query.mwo_id;

//     // Input validation
//     if (!mwo_id) {
//       return res.status(400).json({ message: "mwo id is required." });
//     }
//     const foundMwoService = await MotherServiceRecord.findAll({
//       where: {
//         mwo_id: mwo_id,
//       },
//     });

//     if (foundMwoService.length === 0) {
//       return res.status(200).json({ message: "No service records found." });
//     }

//     res.json(foundMwoService);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const updateMwoStatusDetails = async (req, res) => {
  try {
    const { mwo_id, mwo_status, approved_at, approved_by, approver_comments } =
      req.body;

    if (!mwo_id) {
      return res.status(400).json({ message: "MWO ID is required" });
    }

    const result = await MotherWorkorder.update(
      {
        mwo_status,
        approved_at,
        approved_by,
        approver_comments,
      },
      {
        where: { mwo_id },
      }
    );

    if (result[0] === 0) {
      // No rows updated
      return res.status(404).json({ message: "MWO record not found" });
    }

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getAllMwoMaterial = async (req, res) => {
  try {
    // Input validation

    const foundMwoMaterial = await MotherMaterialRecord.findAll();

    if (foundMwoMaterial.length === 0) {
      return res.status(200).json({ message: "No material records found." });
    }

    res.json(foundMwoMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllMwoService = async (req, res) => {
  try {
    // Input validation

    const foundMwoService = await MotherServiceRecord.findAll();

    if (foundMwoService.length === 0) {
      return res.status(200).json({ message: "No services records found." });
    }

    res.json(foundMwoService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCwoActions = async (req, res) => {
  try {
    const user = req.query.user;
    const cwostatus = req.query.cwostatus;

    // Input validation
    if (!user || !cwostatus) {
      return res
        .status(400)
        .json({ message: "User and cwo status are required." });
    }

    // Define filter conditions based on inventory status
    const whereCondition = {
      cwo_status: cwostatus,
      [Op.or]: [{ cwo_approver_email: user }, { created_by: user }],
    };

    // Fetch inventory data
    const foundCwo = await ChildWorkorder.findAll({
      where: whereCondition,
    });

    // Return the data
    if (!foundCwo || foundCwo.length === 0) {
      return res.status(200).json({ message: "No CWO found." });
    }

    res.status(200).json(foundCwo);
  } catch (error) {
    console.error("Error fetching mwo:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const findChildServices = async (req, res) => {
  try {
    const { cwo_id } = req.query; // Extract mwo_number from the query
    if (!cwo_id) {
      return res.status(400).json({ message: "mwo id is required." });
    }
    const foundMwoService = await ServiceRecord.findAll({
      where: { cwo_id: cwo_id },
      // Filter based on mwo_number
    });
    if (foundMwoService.length === 0) {
      return res.status(200).json({ message: "No service records found." });
    }

    res.json(foundMwoService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findChildMaterials = async (req, res) => {
  try {
    const { cwo_id } = req.query;
    if (!cwo_id) {
      return res.status(400).json({ message: "cwo id is required." });
    }
    const foundChildMaterials = await MaterialRecord.findAll({
      where: { cwo_id: cwo_id },
    });

    if (foundChildMaterials.length === 0) {
      return res.status(200).json({ message: "No material records found." });
    }

    res.json(foundChildMaterials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllCwoMaterial = async (req, res) => {
  try {
    // Input validation

    const foundCwoMaterial = await MaterialRecord.findAll();

    if (foundCwoMaterial.length === 0) {
      return res.status(200).json({ message: "No material records found." });
    }

    res.json(foundCwoMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllCwoService = async (req, res) => {
  try {
    // Input validation

    const foundCwoService = await ServiceRecord.findAll();

    if (foundCwoService.length === 0) {
      return res.status(200).json({ message: "No services records found." });
    }

    res.json(foundCwoService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateCwoApproveDetails = async (req, res) => {
  try {
    const { cwo_id, cwo_status, approved_at, approved_by, approver_comments } =
      req.body;

    if (!cwo_id) {
      return res.status(400).json({ message: "CWO ID is required" });
    }

    const result = await MotherWorkorder.update(
      {
        cwo_status,
        approved_at,
        approved_by,
        approver_comments,
      },
      {
        where: { cwo_id },
      }
    );

    if (result[0] === 0) {
      // No rows updated
      return res.status(404).json({ message: "MWO record not found" });
    }

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const rejectCwo = async (req, res) => {
  const {
    mwo_id,
    cwo_id,
    cwo_status,
    approved_at,
    approved_by,
    approver_comments,
  } = req.body;

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Fetch child materials and services
    const childMaterials = await MaterialRecord.findAll({
      where: { cwo_id },
      transaction,
    });
    const childServices = await ServiceRecord.findAll({
      where: { cwo_id },
      transaction,
    });

    // Update child materials and services quantities to "0"

    // Fetch mother materials and services
    const motherMaterials = await MotherMaterialRecord.findAll({
      where: { mwo_id },
      transaction,
    });
    const motherServices = await MotherServiceRecord.findAll({
      where: { mwo_id },
      transaction,
    });

    // Update mother materials and services by adding child quantities to their balance quantities
    await Promise.all(
      motherMaterials.map((material) => {
        const childMaterialQty = childMaterials
          .filter((child) => child.material_id === material.material_id)
          .reduce(
            (total, child) => total + parseFloat(child.material_wo_qty || "0"),
            0
          ); // Parse as numbers

        console.log(childMaterialQty);

        console.log(childMaterials);

        return MotherMaterialRecord.update(
          {
            material_bal_qty: (
              parseFloat(material.material_bal_qty || "0") + childMaterialQty
            ).toString(),
          },
          {
            where: { record_id: material.record_id },
            transaction,
          }
        );
      })
    );

    await Promise.all(
      childMaterials.map((material) =>
        MaterialRecord.update(
          {
            material_wo_qty: "0", // Update as a string
            material_bal_qty: "0", // Update as a string
          },
          {
            where: { record_id: material.record_id },
            transaction,
          }
        )
      )
    );

    await Promise.all(
      motherServices.map((service) => {
        const childServiceQty = childServices
          .filter((child) => child.service_id === service.service_id)
          .reduce(
            (total, child) => total + parseFloat(child.service_wo_qty || "0"),
            0
          ); // Parse as numbers

        return MotherServiceRecord.update(
          {
            service_bal_qty: (
              parseFloat(service.service_bal_qty || "0") + childServiceQty
            ).toString(), // Convert back to string
          },
          {
            where: { record_id: service.record_id },
            transaction,
          }
        );
      })
    );

    await Promise.all(
      childServices.map((service) =>
        ServiceRecord.update(
          {
            service_wo_qty: "0", // Update as a string
            service_bal_qty: "0", // Update as a string
          },
          {
            where: { record_id: service.record_id },
            transaction,
          }
        )
      )
    );

    // Update CWO status, approval details, and approver comments
    await ChildWorkorder.update(
      {
        cwo_status,
        approved_at,
        approved_by,
        approver_comments,
      },
      {
        where: { cwo_id },
        transaction,
      }
    );

    // Commit the transaction if all updates succeed
    await transaction.commit();
    res.status(200).json({
      message: "Work order rejected and quantities updated successfully",
    });
  } catch (err) {
    // Rollback the transaction on any failure
    await transaction.rollback();
    console.error("Transaction failed:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = {
  createMotherWorkorder,
  findWorkorder,
  findChildMaterials,
  findChildServices,
  findChildWorkorder,
  createChildWorkorder,
  findMotherServices,
  findMotherMaterials,
  getMwoActions,
  updateMwoStatusDetails,
  getAllMwoMaterial,
  getAllMwoService,
  getCwoActions,
  getAllCwoMaterial,
  getAllCwoService,
  updateCwoApproveDetails,
  rejectCwo,
};
