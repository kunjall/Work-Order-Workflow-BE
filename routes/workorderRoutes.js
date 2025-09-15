const express = require("express");
const router = express.Router();
const workorderController = require("../controllers/workorders.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.post(
  "/workorder/create",
  authenticateUser,
  workorderController.createMotherWorkorder
);
router.get(
  "/workorder/find-workorder",
  authenticateUser,
  workorderController.findWorkorder
);

router.get(
  "/workorder/check-mwo-number",
  authenticateUser,
  workorderController.checkMwoNumberExists
);

router.get(
  "/workorder/find-workorder-acq",
  authenticateUser,
  workorderController.findWorkorderAcq
);

router.get(
  "/workorder/find-all-workorder",
  authenticateUser,
  workorderController.findAllWorkorder
);

router.get(
  "/workorder/find-workorder-actions",
  authenticateUser,
  workorderController.getMwoActions
);

router.get(
  "/workorder/find-child-workorder-actions",
  authenticateUser,
  workorderController.getCwoActions
);

router.get(
  "/workorder/find-child-workorder",
  authenticateUser,
  workorderController.findChildWorkorder
);

router.get(
  "/workorder/find-invoice-cwo",
  authenticateUser,
  workorderController.invoiceCwo
);

router.get(
  "/workorder/find-child-services",
  authenticateUser,
  workorderController.findChildServices
);

router.get(
  "/workorder/find-child-material",
  authenticateUser,
  workorderController.findChildMaterials
);

router.get(
  "/workorder/check-child-workorder",
  authenticateUser,
  workorderController.checkChildWorkorderExists
);

router.get(
  "/workorder/find-mother-services",
  authenticateUser,
  workorderController.findMotherServices
);

router.get(
  "/workorder/find-mother-material",
  authenticateUser,
  workorderController.findMotherMaterials
);

router.get(
  "/workorder/find-all-mother-material",
  authenticateUser,
  workorderController.getAllMwoMaterial
);

router.get(
  "/workorder/find-all-mother-service",
  authenticateUser,
  workorderController.getAllMwoService
);

router.get(
  "/workorder/find-all-child-material",
  authenticateUser,
  workorderController.getAllCwoMaterial
);

router.get(
  "/workorder/find-all-child-service",
  authenticateUser,
  workorderController.getAllCwoService
);

router.post(
  "/workorder/createChild",
  authenticateUser,
  workorderController.createChildWorkorder
);

router.patch(
  "/workorder/update-status",
  authenticateUser,
  workorderController.updateMwoStatusDetails
);

router.patch(
  "/workorder/update-cwo-approve-status",
  authenticateUser,
  workorderController.updateCwoApproveDetails
);

router.patch(
  "/workorder/reject-cwo",
  authenticateUser,
  workorderController.rejectCwo
);

router.get(
  "/workorder/get-last-cwo-number",
  authenticateUser,
  workorderController.getLastCwoNumber
);

// MWO Attachment routes
router.get(
  "/workorder/mwo-attachments",
  authenticateUser,
  workorderController.getMwoAttachments
);

router.get(
  "/workorder/mwo-attachments/:attachmentId/download",
  authenticateUser,
  workorderController.downloadMwoAttachment
);

router.patch(
  "/workorder/update-status-with-attachments",
  authenticateUser,
  workorderController.upload.array("attachments", 5),
  workorderController.updateMwoStatusWithAttachments
);

router.patch(
  "/workorder/update-service-rates",
  authenticateUser,
  workorderController.updateMwoServiceRates
);

module.exports = router;
