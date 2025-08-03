const express = require("express");
const router = express.Router();
const mbController = require("../controllers/mbSheet.js");
const authenticateUser = require("../middleware/authMiddleware.js");

// MB creation with file upload support
router.post(
  "/mb/create-mb",
  authenticateUser,
  mbController.upload.array("attachments", 5),
  mbController.createMB
);
router.get("/mb/find-mb", authenticateUser, mbController.findMB);

router.get("/mb/find-mb-actions", authenticateUser, mbController.getMBActions);

router.get(
  "/mb/find-material-mb",
  authenticateUser,
  mbController.findMaterialMB
);

router.get(
  "/mb/find-service-mb",
  authenticateUser,
  mbController.findServicesMB
);

// Attachment related routes
router.get("/mb/attachments", authenticateUser, mbController.getMBAttachments);
router.get(
  "/mb/attachments/:attachment_id/download",
  authenticateUser,
  mbController.downloadMBAttachment
);

router.patch(
  "/mb/update-approve-mb",
  authenticateUser,
  mbController.updateApprovalMb
);

router.patch("/mb/reject-mb", authenticateUser, mbController.updateApprovalMb);

module.exports = router;
