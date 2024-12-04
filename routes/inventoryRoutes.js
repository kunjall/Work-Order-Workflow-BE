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
  "/inventory/get-inventory-reciever",
  authenticateUser,
  inventoryController.getInventoryInwardReciever
);

router.post(
  "/inventory/enterMaterial",
  authenticateUser,
  inventoryController.enterInventoryMaterial
);

module.exports = router;
