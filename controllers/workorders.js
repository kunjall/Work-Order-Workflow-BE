const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { ChildWorkorder } = require("../models/wow_child_workorder");
const { MotherMaterialRecord } = require("../models/wow_mwo_material_record");
const { MotherServiceRecord } = require("../models/wow_mwo_service_record");
const { sequelize } = require("../utils/db");
const { Op, where } = require("sequelize");

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
      state,
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
      materialRecords,
      serviceRecords,
    } = req.body;

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
        state,
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
        bal_service_cost: Number(total_service_cost),
        bal_material_cost: Number(total_material_cost),
      },
      { transaction }
    );

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

    await transaction.commit();

    res.status(201).json({
      message: "Workorder, material, and service records created successfully",
      workorderId: newWorkorder.mwo_id,
    });
  } catch (error) {
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

const findAllWorkorder = async (req, res) => {
  try {
    const foundWorkorder = await MotherWorkorder.findAll({});
    res.json(foundWorkorder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findChildWorkorder = async (req, res) => {
  const { company, internal_manager } = req.query;

  const whereCondition =
    company.toLowerCase() === "tps"
      ? { cwo_status: "Approved", internal_manager: internal_manager }
      : { cwo_status: "Approved", vendor_name: company };

  try {
    const foundChildWorkorder = await ChildWorkorder.findAll({
      where: whereCondition,
    });

    res.json(foundChildWorkorder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const invoiceCwo = async (req, res) => {
  const { mwo_id } = req.query;

  const whereCondition = { mwo_id, cwo_status: "Approved" };

  try {
    const foundChildWorkorder = await ChildWorkorder.findAll({
      where: whereCondition,
    });

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
    route_name,
    vendor_id,
    vendor_name,
    vendor_route_allocation,
    total_service_cost,
    internal_manager,
    execution_city,
    state,
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
    gis_code,
    homepass_count,
    activity,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const createdWorkOrder = await ChildWorkorder.create(
      {
        mwo_id,
        mwo_number,
        vendor_id,
        vendor_name,
        vendor_route_allocation,
        total_service_cost,
        internal_manager,
        route_name,
        execution_city,
        state,
        workorder_type,
        cwo_number,
        total_material_cost,
        cwo_status,
        customer_name,
        cwo_approver_email,
        cwo_approver_name,
        created_at,
        created_by,
        gis_code,
        homepass_count,
        activity,
      },
      { transaction }
    );

    if (materialItems && materialItems.length > 0) {
      for (const material of materialItems) {
        await MaterialRecord.create(
          {
            record_id: `${cwo_number}_${material.material_id}`,
            mwo_number,
            mwo_id: mwo_id,
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

    if (serviceItems && serviceItems.length > 0) {
      for (const service of serviceItems) {
        await ServiceRecord.create(
          {
            record_id: `${cwo_number}_${service.service_id}`,
            mwo_number,
            mwo_id: mwo_id,
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

    await transaction.commit();

    res.status(201).json({
      message: "Work Order and related data created successfully",
      workorderId: createdWorkOrder.cwo_id,
    });
  } catch (error) {
    await transaction.rollback();

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
    const { user, mwostatus, role } = req.query;

    if (!user || !mwostatus) {
      return res
        .status(400)
        .json({ message: "User and MWO status are required." });
    }

    let whereCondition = { mwo_status: mwostatus };

    // If the role does NOT contain 'admin', apply filtering based on the user
    if (!role.toLowerCase().includes("admin")) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { mwo_approver_name: user },
          { mwo_approver1_name: user },
          { mwo_approver2_name: user },
          { created_by: user },
        ],
      };
    }

    const foundMwo = await MotherWorkorder.findAll({
      where: whereCondition,
    });

    if (!foundMwo) {
      return res.status(200).json({ message: "No MWO found." });
    }

    res.status(200).json(foundMwo);
  } catch (error) {
    console.error("Error fetching MWO:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const findMotherServices = async (req, res) => {
  try {
    const { mwo_id } = req.query;
    if (!mwo_id) {
      return res.status(400).json({ message: "mwo id is required." });
    }
    const foundMwoService = await MotherServiceRecord.findAll({
      where: { mwo_id: mwo_id },
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
      where: { mwo_id: mwo_id },
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

const updateMwoStatusDetails = async (req, res) => {
  try {
    const {
      mwo_id,
      mwo_status,
      approved_at,
      approved_by,
      approver_comments,
      mwo_approver1_email,
      mwo_approver1_name,
      mwo_approver2_email,
      mwo_approver2_name,
    } = req.body;

    if (!mwo_id) {
      return res.status(400).json({ message: "MWO ID is required" });
    }

    const updateData = {};

    if (mwo_status) updateData.mwo_status = mwo_status;
    if (approved_at) updateData.approved_at = approved_at;
    if (approved_by) updateData.approved_by = approved_by;
    if (approver_comments) updateData.approver_comments = approver_comments;
    if (mwo_approver1_email)
      updateData.mwo_approver1_email = mwo_approver1_email;
    if (mwo_approver1_name) updateData.mwo_approver1_name = mwo_approver1_name;
    if (mwo_approver2_email)
      updateData.mwo_approver2_email = mwo_approver2_email;
    if (mwo_approver2_name) updateData.mwo_approver2_name = mwo_approver2_name;

    const [updatedRows] = await MotherWorkorder.update(updateData, {
      where: { mwo_id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ message: "MWO record not found" });
    }

    res.status(200).json({ message: "MWO status updated successfully" });
  } catch (err) {
    console.error("Error updating MWO status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllMwoMaterial = async (req, res) => {
  try {
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

const checkChildWorkorderExists = async (req, res) => {
  try {
    const { mwo_number, cwo_number } = req.query;

    if (!mwo_number || !cwo_number) {
      return res
        .status(400)
        .json({ message: "MWO number and CWO number are required." });
    }

    const existingWorkorder = await ChildWorkorder.findOne({
      where: {
        mwo_number,
        cwo_number,
      },
    });

    if (existingWorkorder) {
      return res
        .status(200)
        .json({ exists: true, message: "Child Workorder already exists." });
    }

    res
      .status(200)
      .json({ exists: false, message: "Child Workorder number is available." });
  } catch (error) {
    console.error("Error checking workorder existence:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCwoActions = async (req, res) => {
  try {
    const { user, cwostatus, role } = req.query;

    if (!user || !cwostatus) {
      return res
        .status(400)
        .json({ message: "User and cwo status are required." });
    }

    let whereCondition = { cwo_status: cwostatus };

    // If the role does NOT contain 'admin', apply filtering based on the user
    if (!role.toLowerCase().includes("admin")) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [{ cwo_approver_name: user }, { created_by: user }],
      };
    }

    const foundCwo = await ChildWorkorder.findAll({
      where: whereCondition,
    });

    if (!foundCwo || foundCwo.length === 0) {
      return res.status(200).json({ message: "No CWO found." });
    }

    res.status(200).json(foundCwo);
  } catch (error) {
    console.error("Error fetching CWO:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const findChildServices = async (req, res) => {
  try {
    const { cwo_id } = req.query;
    if (!cwo_id) {
      return res.status(400).json({ message: "mwo id is required." });
    }
    const foundMwoService = await ServiceRecord.findAll({
      where: { cwo_id: cwo_id },
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

    const result = await ChildWorkorder.update(
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

  const transaction = await sequelize.transaction();

  try {
    const childMaterials = await MaterialRecord.findAll({
      where: { cwo_id },
      transaction,
    });
    const childServices = await ServiceRecord.findAll({
      where: { cwo_id },
      transaction,
    });

    const motherMaterials = await MotherMaterialRecord.findAll({
      where: { mwo_id },
      transaction,
    });
    const motherServices = await MotherServiceRecord.findAll({
      where: { mwo_id },
      transaction,
    });

    await Promise.all(
      motherMaterials.map((material) => {
        const childMaterialQty = childMaterials
          .filter((child) => child.material_id === material.material_id)
          .reduce(
            (total, child) => total + parseFloat(child.material_wo_qty || "0"),
            0
          );

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
            material_wo_qty: "0",
            material_bal_qty: "0",
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
          );

        return MotherServiceRecord.update(
          {
            service_bal_qty: (
              parseFloat(service.service_bal_qty || "0") + childServiceQty
            ).toString(),
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
            service_wo_qty: "0",
            service_bal_qty: "0",
          },
          {
            where: { record_id: service.record_id },
            transaction,
          }
        )
      )
    );

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

    await transaction.commit();
    res.status(200).json({
      message: "Work order rejected and quantities updated successfully",
    });
  } catch (err) {
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
  findAllWorkorder,
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
  invoiceCwo,
  checkChildWorkorderExists,
};
