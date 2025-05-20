const express = require("express");
const router = express.Router();
const mbController = require("../controllers/mbSheet.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.post("/mb/create-mb", authenticateUser, mbController.createMB);
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
router.patch(
  "/mb/update-approve-mb",
  authenticateUser,
  mbController.updateApprovalMb
);

router.patch("/mb/reject-mb", authenticateUser, mbController.updateApprovalMb);

module.exports = router;
