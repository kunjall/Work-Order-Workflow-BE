const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { ExpenseRecord } = require("../models/wow_expense_record");
const { ApprovalMatrix } = require("../models/wow_approval_matrix");
const { ChildWorkorder } = require("../models/wow_child_workorder");

const { Sequelize, Op } = require("sequelize");

const findMaterialBudgets = async (req, res) => {
  try {
    const materialBudget = await MaterialRecord.findAll({
      attributes: [
        "cwo_id",
        [
          Sequelize.literal("SUM(material_mb_qty * material_rate)"),
          "material_budget",
        ],
      ],
      group: ["cwo_id"],
      raw: true,
    });

    res.json(materialBudget);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error;
  }
};

const findServiceBudgets = async (req, res) => {
  try {
    const serviceBudget = await ServiceRecord.findAll({
      attributes: [
        "cwo_id",
        [
          Sequelize.literal("SUM(service_mb_qty * service_rate)"),
          "service_budget",
        ],
      ],
      group: ["cwo_id"],
      raw: true,
    });

    res.json(serviceBudget);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error;
  }
};

const updateOverhead = async (req, res) => {
  try {
    const { overhead_budget, mwo_id } = req.body;

    const updatedRows = await MotherWorkorder.update(
      { overhead_budget: overhead_budget },
      { where: { mwo_id } }
    );

    if (updatedRows[0] === 0) {
      return res
        .status(404)
        .json({ message: "MWO not found or no changes made" });
    }

    res.status(200).json({ message: "Overhead budget updated successfully" });
  } catch (err) {
    console.error("Error updating overhead budget:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const expenses = req.body.expenses;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ message: "No expenses provided" });
    }
    for (const expense of expenses) {
      const {
        cwo_id,
        mwo_id,
        expense_status,
        service, // Ensure correct field mapping
        vendor_name, // Match expected key
        qty,
        uom,
        expense_amount, // Correct field name
        unit_price,
        invoice_number,
        invoice_date, // Ensure invoice date is included
        remarks,
        category, // Add category field
        created_by,
        created_at,
        expense_approver1_email,
        expense_approver1_name,
        route_name,
        gst_amount, // Add GST amount field
      } = expense;

      if (
        !cwo_id ||
        !mwo_id ||
        !expense_status ||
        !service || // Ensure correct field mapping
        !vendor_name || // Match expected key
        !qty ||
        !uom ||
        !expense_amount || // Correct field name
        !unit_price ||
        !invoice_number ||
        !invoice_date || // Ensure invoice date is included
        !category || // Add category validation
        !created_by ||
        !created_at ||
        !expense_approver1_email ||
        !expense_approver1_name
      ) {
        return res
          .status(400)
          .json({ message: "Missing required fields in one or more expenses" });
      }
    }

    const newExpenses = await ExpenseRecord.bulkCreate(expenses);

    res.status(200).json({
      message: "Expenses added successfully",
      data: newExpenses,
    });
  } catch (error) {
    console.error("Error adding expenses:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTotalExpenseForMWO = async (req, res) => {
  try {
    const { mwo_id } = req.query;
    const totalExpense = await ExpenseRecord.sum("expense_amount", {
      where: { mwo_id },
    });

    res.json(totalExpense);
  } catch (error) {
    console.error("Error fetching total expense:", error);
    throw error;
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const totalExpense = await ExpenseRecord.findAll({ raw: true });

    res.json(totalExpense);
  } catch (error) {
    console.error("Error fetching total expense:", error);
    throw error;
  }
};

const findInvoiceExpenses = async (req, res) => {
  try {
    const { user, invoicestatus, role } = req.query;

    let whereClause = {};

    if (invoicestatus) {
      whereClause.expense_status = invoicestatus;
    }

    if (!role.includes("admin")) {
      whereClause[Op.or] = [
        { created_by: user },
        { expense_approver1_name: user },
        { expense_approver2_name: user },
      ];
    }

    const expenses = await ExpenseRecord.findAll({
      where: whereClause,
      raw: true,
    });

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching invoice expenses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { expense_id, expense_status, actioned_at, actioned_by } = req.body;

    if (!expense_id) {
      return res.status(400).json({ message: "MWO ID is required" });
    }

    const updateData = {};

    if (expense_status) updateData.expense_status = expense_status;
    if (actioned_at) updateData.actioned_at = actioned_at;
    if (actioned_by) updateData.actioned_by = actioned_by;

    const [updatedRows] = await ExpenseRecord.update(updateData, {
      where: { expense_id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ message: "MWO record not found" });
    }

    res.status(200).json({ message: "MWO status updated successfully" });
  } catch (err) {
    console.error("Error updating expense status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const validateBudget = async (req, res) => {
  try {
    const { expenses, cwo_id, budgeted_service_cost, misc_budget } = req.body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({
        valid: false,
        message: "No expenses provided for validation",
      });
    }

    // Get existing expenses for this CWO
    const existingExpenses = await ExpenseRecord.findAll({
      where: { cwo_id: cwo_id.toString() },
      raw: true,
    });

    // Calculate current totals by category
    const currentBudgetedTotal = existingExpenses
      .filter((expense) => expense.category === "budgeted")
      .reduce(
        (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
        0
      );

    const currentExpenseTotal = existingExpenses
      .filter((expense) => expense.category === "expense")
      .reduce(
        (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
        0
      );

    // Calculate new totals from submitted expenses
    const newBudgetedTotal = expenses
      .filter((expense) => expense.category === "budgeted")
      .reduce(
        (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
        0
      );

    const newExpenseTotal = expenses
      .filter((expense) => expense.category === "expense")
      .reduce(
        (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
        0
      );

    // Calculate final totals
    const finalBudgetedTotal = currentBudgetedTotal + newBudgetedTotal;
    const finalExpenseTotal = currentExpenseTotal + newExpenseTotal;

    // Validate budgeted expenses against budgeted service cost
    if (finalBudgetedTotal > budgeted_service_cost) {
      return res.status(400).json({
        valid: false,
        message: `Budgeted expenses (₹${finalBudgetedTotal.toFixed(
          2
        )}) exceed the budgeted service cost (₹${budgeted_service_cost.toFixed(
          2
        )}). Excess: ₹${(finalBudgetedTotal - budgeted_service_cost).toFixed(
          2
        )}`,
      });
    }

    // Validate expense items against MISC budget
    if (finalExpenseTotal > misc_budget) {
      return res.status(400).json({
        valid: false,
        message: `Expense items (₹${finalExpenseTotal.toFixed(
          2
        )}) exceed the MISC budget (₹${misc_budget.toFixed(2)}). Excess: ₹${(
          finalExpenseTotal - misc_budget
        ).toFixed(2)}`,
      });
    }

    res.status(200).json({
      valid: true,
      message: "Budget validation passed",
      summary: {
        budgeted: {
          current: currentBudgetedTotal,
          new: newBudgetedTotal,
          total: finalBudgetedTotal,
          limit: budgeted_service_cost,
          remaining: budgeted_service_cost - finalBudgetedTotal,
        },
        expense: {
          current: currentExpenseTotal,
          new: newExpenseTotal,
          total: finalExpenseTotal,
          limit: misc_budget,
          remaining: misc_budget - finalExpenseTotal,
        },
      },
    });
  } catch (error) {
    console.error("Error validating budget:", error);
    res.status(500).json({
      valid: false,
      message: "Internal server error during budget validation",
      error: error.message,
    });
  }
};

// SCM Budget validation - returns generic error messages without exposing budget details
const validateBudgetSCM = async (req, res) => {
  try {
    const { expenses, cwo_id } = req.body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({
        valid: false,
        message: "No expenses provided for validation",
      });
    }

    // Get the MWO and budget information from the first expense
    const mwo_id = expenses[0]?.mwo_id;
    if (!mwo_id) {
      return res.status(400).json({
        valid: false,
        message: "MWO ID is required for validation",
      });
    }

    // Get MWO details to fetch budget information
    const mwoDetails = await MotherWorkorder.findOne({
      where: { mwo_id: mwo_id.toString() },
      raw: true,
    });

    if (!mwoDetails) {
      return res.status(400).json({
        valid: false,
        message: "Work order not found",
      });
    }

    // Extract budget values from MWO
    const budgeted_service_cost = parseFloat(
      mwoDetails.bal_service_cost?.replace(/[^0-9.]/g, "") || 0
    );
    const misc_budget = parseFloat(mwoDetails.overhead_budget || 0);

    // Get existing expenses for this CWO
    const existingExpenses = await ExpenseRecord.findAll({
      where: { cwo_id: cwo_id.toString() },
      raw: true,
    });

    // Calculate current totals by category
    const currentBudgetedTotal = existingExpenses
      .filter((expense) => expense.category === "budgeted")
      .reduce(
        (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
        0
      );

    const currentExpenseTotal = existingExpenses
      .filter((expense) => expense.category === "expense")
      .reduce(
        (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
        0
      );

    // Calculate new totals from submitted expenses
    const newBudgetedTotal = expenses
      .filter((expense) => expense.category === "budgeted")
      .reduce(
        (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
        0
      );

    const newExpenseTotal = expenses
      .filter((expense) => expense.category === "expense")
      .reduce(
        (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
        0
      );

    // Calculate final totals
    const finalBudgetedTotal = currentBudgetedTotal + newBudgetedTotal;
    const finalExpenseTotal = currentExpenseTotal + newExpenseTotal;

    // Validate budgeted expenses against budgeted service cost
    if (finalBudgetedTotal > budgeted_service_cost) {
      return res.status(400).json({
        valid: false,
        message: "Invoice exceeds allowed limit for budgeted items",
      });
    }

    // Validate expense items against MISC budget
    if (finalExpenseTotal > misc_budget) {
      return res.status(400).json({
        valid: false,
        message: "Invoice exceeds allowed limit for expense items",
      });
    }

    res.status(200).json({
      valid: true,
      message: "Budget validation passed",
    });
  } catch (error) {
    console.error("Error validating budget:", error);
    res.status(500).json({
      valid: false,
      message:
        "Invoice exceeds allowed limit. Please check your entries and try again.",
    });
  }
};

module.exports = {
  findMaterialBudgets,
  findServiceBudgets,
  updateOverhead,
  addExpense,
  getTotalExpenseForMWO,
  getAllExpenses,
  findInvoiceExpenses,
  updateInvoiceStatus,
  validateBudget,
  validateBudgetSCM,
};
