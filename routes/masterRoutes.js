const express = require("express");
const router = express.Router();
const masterController = require("../controllers/master.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.get(
  "/master/findCustomer",
  authenticateUser,
  masterController.findCustomer
);
router.get("/master/findCity", authenticateUser, masterController.findCity);

router.get(
  "/master/find-material",
  authenticateUser,
  masterController.findMaterial
);
router.get(
  "/master/find-service",
  authenticateUser,
  masterController.findServices
);
router.get(
  "/master/find-vendors",
  authenticateUser,
  masterController.findVendors
);

router.get(
  "/master/find-warehouse",
  authenticateUser,
  masterController.findWarehouses
);

router.get(
  "/master/find-client-warehouse",
  authenticateUser,
  masterController.findClientWarehouses
);

router.get(
  "/master/find-locators",
  authenticateUser,
  masterController.findLocators
);

router.get(
  "/master/find-locator-stock",
  authenticateUser,
  masterController.findLocatorStock
);

module.exports = router;
