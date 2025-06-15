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

router.get(
  "/invoice/find-all-expense",
  authenticateUser,
  invoiceController.getAllExpenses
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

router.get(
  "/invoice/find-invoice-expenses",
  authenticateUser,
  invoiceController.findInvoiceExpenses
);

router.patch(
  "/invoice/update-expense-status",
  authenticateUser,
  invoiceController.updateInvoiceStatus
);

module.exports = router;
