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

module.exports = router;
