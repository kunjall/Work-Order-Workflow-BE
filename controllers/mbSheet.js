const { LocatorStock } = require("../models/wow_locator_stock");
const { MmMaterial } = require("../models/wow_mm_materials");
const { MaterialManagement } = require("../models/wow_material_management");
const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { InventoryStock } = require("../models/wow_inventory_stock.js");
const { MbSheet } = require("../models/wow_mb_sheet.js");
const { MbService } = require("../models/wow_mb_service_record.js");
const { MbMaterial } = require("../models/wow_mb_material_record.js");
const { MbAttachment } = require("../models/wow_mb_attachment.js");
const { sequelize } = require("../utils/db");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|xlsb/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only jpeg, jpg, png, pdf, doc, xlsx files are allowed!"));
    }
  },
});

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
    const whereClause = {
      cwo_number,
    };

    if (mbstatus) {
      whereClause.mb_status = {
        [Op.notIn]: [mbstatus, "Approved"],
        [Op.notLike]: "%Rejected%",
      };
    }

    const mbRecords = await MbSheet.findAll({ where: whereClause });

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
  } = req.body;

  // Parse JSON strings from FormData
  let materialItems = [];
  let serviceItems = [];

  try {
    materialItems = req.body.materialItems
      ? JSON.parse(req.body.materialItems)
      : [];
    serviceItems = req.body.serviceItems
      ? JSON.parse(req.body.serviceItems)
      : [];
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON format for items" });
  }

  const transaction = await sequelize.transaction();

  try {
    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "At least one attachment is required to submit MB",
      });
    }

    // Validate file count (max 5 files)
    if (req.files.length > 5) {
      return res.status(400).json({
        error: "Maximum 5 files are allowed",
      });
    }

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
        attachment_url: null, // Remove attachment_url as we're using the new table
      },
      { transaction }
    );

    // Store attachments in the new attachment table
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await MbAttachment.create(
          {
            mb_id: createdMB.mb_id,
            attachment: file.buffer,
            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
          },
          { transaction }
        );
      }
    }

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
    res.status(201).json({
      message: "MB and related data created successfully",
      mb_id: createdMB.mb_id,
      attachments_count: req.files.length,
    });
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
    const { user, mbstatus, role } = req.query;

    if (!user || !mbstatus) {
      return res
        .status(400)
        .json({ message: "User and MB status are required." });
    }

    let whereCondition = { mb_status: mbstatus };

    // If the role does NOT contain 'admin', apply filtering based on the user
    if (!role.toLowerCase().includes("admin")) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { mb_approver1_name: user },
          { requested_by: user },
          { mb_approver2_name: user },
          { mb_approver3_name: user },
        ],
      };
    }

    const foundMB = await MbSheet.findAll({
      where: whereCondition,
    });

    if (!foundMB || foundMB.length === 0) {
      return res.status(200).json({ message: "No MB found." });
    }

    res.status(200).json(foundMB);
  } catch (error) {
    console.error("Error fetching MB:", error);
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

    if (mb_status.toLowerCase() === "approved") {
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
    } else if (mb_status.toLowerCase().includes("rejected by billing spoc")) {
      // If rejected by Billing SPOC, add the MB quantities back to the locator
      for (const item of mbMaterial) {
        await LocatorStock.increment(
          { stock_qty: item.material_log_qty },
          {
            where: { material_id: item.material_id, locator_name },
            transaction,
          }
        );
      }
    }
    await transaction.commit();
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error("Error in updateApprovalMb:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

// Function to get attachments for a specific MB
const getMBAttachments = async (req, res) => {
  try {
    const { mb_id } = req.query;

    if (!mb_id) {
      return res.status(400).json({ message: "MB ID is required" });
    }

    const attachments = await MbAttachment.findAll({
      where: { mb_id },
      attributes: ["attachment_id", "file_name", "file_type", "file_size"],
    });

    res.status(200).json(attachments);
  } catch (error) {
    console.error("Error fetching MB attachments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to download a specific attachment
const downloadMBAttachment = async (req, res) => {
  try {
    const { attachment_id } = req.params;

    const attachment = await MbAttachment.findOne({
      where: { attachment_id },
    });

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    res.setHeader("Content-Type", attachment.file_type);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.file_name}"`
    );
    res.setHeader("Content-Length", attachment.file_size);

    res.send(attachment.attachment);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    res.status(500).json({ message: "Internal server error" });
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
  getMBAttachments,
  downloadMBAttachment,
  upload, // Export the multer upload middleware
};
