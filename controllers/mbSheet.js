const { LocatorStock } = require("../models/wow_locator_stock");
const { MmMaterial } = require("../models/wow_mm_materials");
const { MaterialManagement } = require("../models/wow_material_management");
const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { InventoryStock } = require("../models/wow_inventory_stock.js");
const { MbSheet } = require("../models/wow_mb_sheet.js");
const { MbService } = require("../models/wow_mb_service_record.js");
const { MbMaterial } = require("../models/wow_mb_material_record.js");
const { sequelize } = require("../utils/db");
const { Op } = require("sequelize");

const findMaterialLocatorStock = async (req, res) => {
  try {
    const { material_id, locator_name } = req.query;
    const foundMaterialStock = await LocatorStock.findAll({
      where: { material_id, locator_name },
    });
    res.json(foundMaterialStock);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findMB = async (req, res) => {
  const { cwo_number, mbstatus } = req.query;

  try {
    const mbRecords = await MbSheet.findAll({
      where: {
        cwo_number,
        mb_status: {
          [Op.notIn]: [mbstatus, "Approved"], // Exclude exact matches
          [Op.notLike]: "%Rejected%", // Exclude anything containing "Rejected"
        },
      },
    });

    res.status(200).json(mbRecords);
  } catch (error) {
    console.error("Error fetching MB records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createMB = async (req, res) => {
  const {
    vendor_id,
    tps_pm,
    vendor_name,
    route_name,
    gis_code,
    execution_city,
    state,
    internal_external,
    locator_name,
    mb_status,
    customer_name,
    mb_approver1_email,
    mb_approver1_name,
    requested_by,
    requested_at,
    cwo_id,
    cwo_number,
    attachment_url,
    materialItems,
    serviceItems,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const createdMB = await MbSheet.create(
      {
        vendor_id,
        tps_pm,
        vendor_name,
        route_name,
        gis_code,
        execution_city,
        state,
        internal_external,
        locator_name,
        mb_status,
        customer_name,
        mb_approver1_email,
        mb_approver1_name,
        requested_by,
        requested_at,
        cwo_id,
        cwo_number,
        attachment_url,
      },
      { transaction }
    );

    if (materialItems && materialItems.length > 0) {
      for (const material of materialItems) {
        await MbMaterial.create(
          {
            record_id: `${createdMB.mb_id}_${material.material_id}`,
            mb_id: createdMB.mb_id,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_log_qty: material.mb_qty,
            locator_name: locator_name,
            cwo_id: cwo_id,
            cwo_number: cwo_number,
            material_unit_price: material.material_rate,
            material_price: material.material_mb_price,
          },
          { transaction }
        );
      }
    }

    if (serviceItems && serviceItems.length > 0) {
      for (const service of serviceItems) {
        await MbService.create(
          {
            record_id: `${createdMB.mb_id}_${service.service_id}`,
            mb_id: createdMB.mb_id,
            service_id: service.service_id,
            service_desc: service.service_desc,
            service_uom: service.service_uom,
            service_log_qty: service.mb_qty,
            cwo_id: cwo_id,
            cwo_number: cwo_number,
            service_unit_price: service.service_rate,
            service_price: service.service_mb_price,
            locator_name: locator_name,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    res
      .status(201)
      .json({ message: "MB and related data created successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const findChildMaterialStock = async (req, res) => {
  try {
    const { cwo_id, locator_name } = req.query;
    const foundChildMaterialStock = await MmMaterial.findAll({
      where: { cwo_id, locator_name },
    });
    res.json(foundChildMaterialStock);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMBActions = async (req, res) => {
  try {
    const user = req.query.user;
    const mbstatus = req.query.mbstatus;

    if (!user || !mbstatus) {
      return res
        .status(400)
        .json({ message: "User and cwo status are required." });
    }

    const whereCondition = {
      mb_status: mbstatus,
      [Op.or]: [
        { mb_approver1_email: user },
        { requested_by: user },
        { mb_approver2_email: user },
        { mb_approver3_email: user },
      ],
    };

    const foundMB = await MbSheet.findAll({
      where: whereCondition,
    });

    if (!foundMB || foundMB.length === 0) {
      return res.status(200).json({ message: "No MM found." });
    }

    res.status(200).json(foundMB);
  } catch (error) {
    console.error("Error fetching mwo:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const findMaterialMB = async (req, res) => {
  try {
    const { mb_id } = req.query;

    const whereClause = mb_id ? { where: { mb_id } } : {};

    const foundMaterialMB = await MbMaterial.findAll(whereClause);

    res.json(foundMaterialMB);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findServicesMB = async (req, res) => {
  try {
    const { mb_id } = req.query;

    const whereClause = mb_id ? { where: { mb_id } } : {};

    const foundMBService = await MbService.findAll(whereClause);

    if (foundMBService.length === 0) {
      return res.status(200).json({ message: "No service records found." });
    }

    res.json(foundMBService);
  } catch (error) {
    console.error("Error finding Service records:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findAllMmMaterial = async (req, res) => {
  try {
    const foundMaterialMM = await MmMaterial.findAll();
    res.json(foundMaterialMM);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const rejectApprovalMb = async (req, res) => {
  try {
    const { mb_id, mb_status, actioned_at, actioned_by, approver_comments } =
      req.body;

    await MbSheet.update(
      {
        mb_status,
        actioned_at,
        actioned_by,
        approver_comments,
      },
      {
        where: { mb_id },
      }
    );
  } catch (err) {}
};

const updateApprovalMb = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      cwo_id,
      mb_id,
      mb_status,
      actioned_at,
      actioned_by,
      approver_comments,
      mbMaterial,
      mbService,
      mb_approver2_email,
      mb_approver2_name,
      mb_approver3_email,
      mb_approver3_name,
      mb_approver4_email,
      mb_approver4_name,
      locator_name,
    } = req.body;

    await MbSheet.update(
      {
        mb_status,
        actioned_at,
        actioned_by,
        approver_comments,
        mb_approver2_email,
        mb_approver2_name,
        mb_approver3_email,
        mb_approver3_name,
        mb_approver4_email,
        mb_approver4_name,
      },
      {
        where: { mb_id },
        transaction,
      }
    );

    if (mb_status.toLowerCase() === "pending with billing spoc") {
      for (const item of mbMaterial) {
        await MaterialRecord.increment(
          { material_mb_qty: parseInt(item.material_log_qty) },
          {
            where: { material_id: item.material_id, cwo_id },
            transaction,
          }
        );
        await LocatorStock.decrement(
          { stock_qty: item.material_log_qty },
          {
            where: { material_id: item.material_id, locator_name },
            transaction,
          }
        );
      }
      for (const item of mbService) {
        await ServiceRecord.increment(
          { service_mb_qty: parseInt(item.service_log_qty) },
          {
            where: { service_id: item.service_id, cwo_id },
            transaction,
          }
        );
      }
    }
    await transaction.commit();
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error("Error in updateApprovalMm:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = {
  findMaterialLocatorStock,
  findChildMaterialStock,
  findAllMmMaterial,
  updateApprovalMb,
  rejectApprovalMb,
  findMaterialMB,
  findServicesMB,
  createMB,
  findMB,
  getMBActions,
};
