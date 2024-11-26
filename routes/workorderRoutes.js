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

router.post(
  "/workorder/enterMaterial",
  authenticateUser,
  workorderController.enterMaterial
);
router.post(
  "/workorder/enterServices",
  authenticateUser,
  workorderController.enterServices
);

router.post(
  "/workorder/createChild",
  authenticateUser,
  workorderController.createChildWorkorder
);

module.exports = router;
