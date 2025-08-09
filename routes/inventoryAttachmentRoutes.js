const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  uploadInventoryAttachment,
  getInventoryAttachment,
  downloadInventoryAttachment,
  deleteInventoryAttachment,
  checkInventoryAttachment,
} = require("../controllers/inventoryAttachment");
const authenticateUser = require("../middleware/authMiddleware.js");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const allowedExtensions = [
      ".pdf",
      ".jpeg",
      ".jpg",
      ".png",
      ".xls",
      ".xlsx",
    ];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (
      allowedTypes.includes(file.mimetype) &&
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, JPEG, JPG, PNG, XLS, and XLSX files are allowed."
        ),
        false
      );
    }
  },
});

// Apply authentication middleware to all routes

// Upload inventory attachment
router.post(
  "/upload",
  authenticateUser,
  upload.single("attachment"),
  uploadInventoryAttachment
);

// Get inventory attachment info
router.get("/:inventory_id", authenticateUser, getInventoryAttachment);

// Download inventory attachment
router.get(
  "/:inventory_id/download",
  authenticateUser,
  downloadInventoryAttachment
);

// Delete inventory attachment
router.delete("/:inventory_id", authenticateUser, deleteInventoryAttachment);

// Check if inventory has attachment
router.get("/:inventory_id/check", authenticateUser, checkInventoryAttachment);

module.exports = router;
