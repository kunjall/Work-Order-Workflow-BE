const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.get(
  "/invoice/find-material-budget",
  authenticateUser,
  invoiceController.findMaterialBudgets
);

router.get(
  "/invoice/find-service-budget",
  authenticateUser,
  invoiceController.findServiceBudgets
);

router.get(
  "/invoice/find-total-overhead",
  authenticateUser,
  invoiceController.getTotalExpenseForMWO
);

router.patch(
  "/invoice/update-overhead-budget",
  authenticateUser,
  invoiceController.updateOverhead
);

router.post(
  "/invoice/add-overhead-expense",
  authenticateUser,
  invoiceController.addExpense
);

module.exports = router;
