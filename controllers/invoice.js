const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { ExpenseRecord } = require("../models/wow_expense_record");

const { Sequelize } = require("sequelize");

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
        service,
        expense_amount,
        uom,
        qty,
        unit_price,
        vendor_name,
      } = expense;

      if (
        !cwo_id ||
        !mwo_id ||
        !service ||
        !expense_amount ||
        !uom ||
        !qty ||
        !unit_price ||
        !vendor_name
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

module.exports = {
  findMaterialBudgets,
  findServiceBudgets,
  updateOverhead,
  addExpense,
  getTotalExpenseForMWO,
  getAllExpenses,
};
