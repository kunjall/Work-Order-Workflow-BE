const express = require("express");
const router = express.Router();
const masterCrudController = require("../controllers/masterCrud.js");
const authenticateUser = require("../middleware/authMiddleware.js");

// Material Master CRUD routes
router.get(
  "/master/materials",
  authenticateUser,
  masterCrudController.getAllMaterials
);

router.get(
  "/master/materials/:id",
  authenticateUser,
  masterCrudController.getMaterialById
);

router.post(
  "/master/materials",
  authenticateUser,
  masterCrudController.createMaterial
);

router.put(
  "/master/materials/:id",
  authenticateUser,
  masterCrudController.updateMaterial
);

router.delete(
  "/master/materials/:id",
  authenticateUser,
  masterCrudController.deleteMaterial
);

// Service Master CRUD routes
router.get(
  "/master/services",
  authenticateUser,
  masterCrudController.getAllServices
);

router.get(
  "/master/services/:id",
  authenticateUser,
  masterCrudController.getServiceById
);

router.post(
  "/master/services",
  authenticateUser,
  masterCrudController.createService
);

router.put(
  "/master/services/:id",
  authenticateUser,
  masterCrudController.updateService
);

router.delete(
  "/master/services/:id",
  authenticateUser,
  masterCrudController.deleteService
);

// Vendor Master CRUD routes
router.get(
  "/master/vendors",
  authenticateUser,
  masterCrudController.getAllVendors
);

router.get(
  "/master/vendors/:id",
  authenticateUser,
  masterCrudController.getVendorById
);

router.post(
  "/master/vendors",
  authenticateUser,
  masterCrudController.createVendor
);

router.put(
  "/master/vendors/:id",
  authenticateUser,
  masterCrudController.updateVendor
);

router.delete(
  "/master/vendors/:id",
  authenticateUser,
  masterCrudController.deleteVendor
);

// Locator Master CRUD routes
router.get(
  "/master/locators",
  authenticateUser,
  masterCrudController.getAllLocators
);

router.get(
  "/master/locators/:id",
  authenticateUser,
  masterCrudController.getLocatorById
);

router.post(
  "/master/locators",
  authenticateUser,
  masterCrudController.createLocator
);

router.put(
  "/master/locators/:id",
  authenticateUser,
  masterCrudController.updateLocator
);

router.delete(
  "/master/locators/:id",
  authenticateUser,
  masterCrudController.deleteLocator
);

// Warehouse Master CRUD routes
router.get(
  "/master/warehouse",
  authenticateUser,
  masterCrudController.getAllWarehouses
);

router.get(
  "/master/warehouse/:id",
  authenticateUser,
  masterCrudController.getWarehouseById
);

router.post(
  "/master/warehouse",
  authenticateUser,
  masterCrudController.createWarehouse
);

router.put(
  "/master/warehouse/:id",
  authenticateUser,
  masterCrudController.updateWarehouse
);

router.delete(
  "/master/warehouse/:id",
  authenticateUser,
  masterCrudController.deleteWarehouse
);

// Customer Master CRUD routes
router.get(
  "/master/customer",
  authenticateUser,
  masterCrudController.getAllCustomers
);

router.get(
  "/master/customer/:id",
  authenticateUser,
  masterCrudController.getCustomerById
);

router.post(
  "/master/customer",
  authenticateUser,
  masterCrudController.createCustomer
);

router.put(
  "/master/customer/:id",
  authenticateUser,
  masterCrudController.updateCustomer
);

router.delete(
  "/master/customer/:id",
  authenticateUser,
  masterCrudController.deleteCustomer
);

// Customer WH Master CRUD routes
router.get(
  "/master/customerWarehouse",
  authenticateUser,
  masterCrudController.getAllClientWarehouses
);

router.get(
  "/master/customerWarehouse/:id",
  authenticateUser,
  masterCrudController.getClientWarehouseById
);

router.post(
  "/master/customerWarehouse",
  authenticateUser,
  masterCrudController.createClientWarehouse
);

router.put(
  "/master/customerWarehouse/:id",
  authenticateUser,
  masterCrudController.updateClientWarehouse
);

router.delete(
  "/master/customerWarehouse/:id",
  authenticateUser,
  masterCrudController.deleteClientWarehouse
);

module.exports = router;
