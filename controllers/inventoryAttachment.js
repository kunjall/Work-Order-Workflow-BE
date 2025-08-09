const { InventoryAttachment } = require("../models/wow_inventory_attachment");

// Upload inventory attachment
const uploadInventoryAttachment = async (req, res) => {
  try {
    const { inventory_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!inventory_id) {
      return res.status(400).json({
        success: false,
        message: "Inventory ID is required",
      });
    }

    // Check if attachment already exists for this inventory
    const existingAttachment = await InventoryAttachment.findOne({
      where: { inventory_id: inventory_id },
    });

    if (existingAttachment) {
      // Update existing attachment
      await existingAttachment.update({
        attachment: req.file.buffer,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
      });

      return res.status(200).json({
        success: true,
        message: "Attachment updated successfully",
        attachment_id: existingAttachment.attachment_id,
      });
    } else {
      // Create new attachment
      const newAttachment = await InventoryAttachment.create({
        inventory_id: inventory_id,
        attachment: req.file.buffer,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
      });

      return res.status(201).json({
        success: true,
        message: "Attachment uploaded successfully",
        attachment_id: newAttachment.attachment_id,
      });
    }
  } catch (error) {
    console.error("Error uploading inventory attachment:", error);

    if (error.message.includes("Invalid file type")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload attachment",
      error: error.message,
    });
  }
};

// Get inventory attachment
const getInventoryAttachment = async (req, res) => {
  try {
    const { inventory_id } = req.params;

    const attachment = await InventoryAttachment.findOne({
      where: { inventory_id: inventory_id },
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    return res.status(200).json({
      success: true,
      attachment: {
        attachment_id: attachment.attachment_id,
        inventory_id: attachment.inventory_id,
        file_name: attachment.file_name,
        file_type: attachment.file_type,
        file_size: attachment.file_size,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory attachment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attachment",
      error: error.message,
    });
  }
};

// Download inventory attachment
const downloadInventoryAttachment = async (req, res) => {
  try {
    const { inventory_id } = req.params;

    const attachment = await InventoryAttachment.findOne({
      where: { inventory_id: inventory_id },
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    res.set({
      "Content-Type": attachment.file_type,
      "Content-Disposition": `attachment; filename="${attachment.file_name}"`,
      "Content-Length": attachment.file_size,
    });

    return res.send(attachment.attachment);
  } catch (error) {
    console.error("Error downloading inventory attachment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download attachment",
      error: error.message,
    });
  }
};

// Delete inventory attachment
const deleteInventoryAttachment = async (req, res) => {
  try {
    const { inventory_id } = req.params;

    const attachment = await InventoryAttachment.findOne({
      where: { inventory_id: inventory_id },
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    await attachment.destroy();

    return res.status(200).json({
      success: true,
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory attachment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete attachment",
      error: error.message,
    });
  }
};

// Check if inventory has attachment
const checkInventoryAttachment = async (req, res) => {
  try {
    const { inventory_id } = req.params;

    const attachment = await InventoryAttachment.findOne({
      where: { inventory_id: inventory_id },
      attributes: ["attachment_id", "file_name", "file_type", "file_size"],
    });

    return res.status(200).json({
      success: true,
      hasAttachment: !!attachment,
      attachment: attachment || null,
    });
  } catch (error) {
    console.error("Error checking inventory attachment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check attachment",
      error: error.message,
    });
  }
};

module.exports = {
  uploadInventoryAttachment,
  getInventoryAttachment,
  downloadInventoryAttachment,
  deleteInventoryAttachment,
  checkInventoryAttachment,
};
