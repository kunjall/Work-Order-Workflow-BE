const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.post(
  "/inventory/create",
  authenticateUser,
  inventoryController.enterInventory
);

router.get(
  "/inventory/get-inventory-receiver",
  authenticateUser,
  inventoryController.getInventoryInwardReciever
);

router.get(
  "/inventory/get-inventory-materials",
  authenticateUser,
  inventoryController.getInventoryMaterialInventory
);

router.get(
  "/inventory/get-all-inventory-materials",
  authenticateUser,
  inventoryController.getAllInventoryMaterial
);

router.post(
  "/inventory/enterMaterial",
  authenticateUser,
  inventoryController.enterInventoryMaterial
);

router.patch(
  "/inventory/updateReceived",
  authenticateUser,
  inventoryController.updateReceivedDetails
);

router.patch(
  "/inventory/updateApproved",
  authenticateUser,
  inventoryController.updateApprovedDetails
);

module.exports = router;
