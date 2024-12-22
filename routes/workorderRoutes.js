const express = require("express");
const router = express.Router();
const workorderController = require("../controllers/workorders.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.post("/workorder/create", authenticateUser, workorderController.create);
router.get(
  "/workorder/find-workorder",
  authenticateUser,
  workorderController.findWorkorder
);

router.get(
  "/workorder/find-child-workorder",
  authenticateUser,
  workorderController.findChildWorkorder
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
  "/workorder/find-mother-services",
  authenticateUser,
  workorderController.findMotherServices
);

router.get(
  "/workorder/find-mother-material",
  authenticateUser,
  workorderController.findMotherMaterials
);

router.post(
  "/workorder/motherEnterMaterial",
  authenticateUser,
  workorderController.motherEnterMaterial
);
router.post(
  "/workorder/motherEnterServices",
  authenticateUser,
  workorderController.motherEnterServices
);

router.post(
  "/workorder/createChild",
  authenticateUser,
  workorderController.createChildWorkorder
);

module.exports = router;
