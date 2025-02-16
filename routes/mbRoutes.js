const express = require("express");
const router = express.Router();
const mbController = require("../controllers/mbSheet.js");
const authenticateUser = require("../middleware/authMiddleware.js");

// router.get(
//   "/mm/find-material-stock",
//   authenticateUser,
//   mmController.findMaterialLocatorStock
// );

router.post("/mb/create-mb", authenticateUser, mbController.createMB);
router.get("/mb/find-mb", authenticateUser, mbController.findMB);

// router.get(
//   "/mm/find-material-stock-child",
//   authenticateUser,
//   mmController.findChildMaterialStock
// );

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
router.patch(
  "/mb/update-approve-mb",
  authenticateUser,
  mbController.updateApprovalMb
);

router.patch("/mb/reject-mb", authenticateUser, mbController.updateApprovalMb);
// router.get(
//   "/mm/find-all-mm-material",
//   authenticateUser,
//   mmController.findAllMmMaterial
// );

// router.get(
//   "/mm/find-all-mm-material-mb",
//   authenticateUser,
//   mmController.findMaterialMMforMB
// );

// router.patch(
//   "/mm/update-approve-mm",
//   authenticateUser,
//   mmController.updateApprovalMm
// );

// router.patch("/mm/reject-mm", authenticateUser, mmController.updateApprovalMm);

module.exports = router;
