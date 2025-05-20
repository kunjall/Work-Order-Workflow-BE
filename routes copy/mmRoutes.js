const express = require("express");
const router = express.Router();
const mmController = require("../controllers/materialManagement.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.get(
  "/mm/find-material-stock",
  authenticateUser,
  mmController.findMaterialLocatorStock
);

router.post("/mm/create-mm", authenticateUser, mmController.createMM);

router.get(
  "/mm/find-material-stock-child",
  authenticateUser,
  mmController.findChildMaterialStock
);

router.get("/mm/find-mm-actions", authenticateUser, mmController.getMMActions);

router.get(
  "/mm/find-material-mm",
  authenticateUser,
  mmController.findMaterialMM
);

router.get(
  "/mm/find-all-mm-material",
  authenticateUser,
  mmController.findAllMmMaterial
);

router.get(
  "/mm/find-all-mm-material-mb",
  authenticateUser,
  mmController.findMaterialMMforMB
);

router.patch(
  "/mm/update-approve-mm",
  authenticateUser,
  mmController.updateApprovalMm
);

router.patch("/mm/reject-mm", authenticateUser, mmController.updateApprovalMm);

module.exports = router;
