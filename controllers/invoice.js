const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { ExpenseRecord } = require("../models/wow_expense_record");
const { ApprovalMatrix } = require("../models/wow_approval_matrix");

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
        created_by,
        created_at,
        expense_approver1_email,
        expense_approver1_name,
        route_name,
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
        !remarks ||
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

    if (role !== "admin") {
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

module.exports = {
  findMaterialBudgets,
  findServiceBudgets,
  updateOverhead,
  addExpense,
  getTotalExpenseForMWO,
  getAllExpenses,
  findInvoiceExpenses,
  updateInvoiceStatus,
};
