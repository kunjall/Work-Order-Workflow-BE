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
  inventoryController.getInventoryMaterial
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

module.exports = router;
