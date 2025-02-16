const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { ExpenseRecord } = require("../models/wow_expense_record");

const { Sequelize } = require("sequelize");

const findMaterialBudgets = async (req, res) => {
  try {
    // Fetch Material Budget
    const materialBudget = await MaterialRecord.findAll({
      attributes: [
        "cwo_id",
        [
          Sequelize.literal("SUM(material_mb_qty * material_rate)"),
          "material_budget",
        ],
      ],
      group: ["cwo_id"], // Group by cwo_id to aggregate data
      raw: true,
      logging: console.log,
    });

    res.json(materialBudget);

    // Fetch Service Budget
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error;
  }
};

const findServiceBudgets = async (req, res) => {
  try {
    // Fetch Material Budget

    // Fetch Service Budget
    const serviceBudget = await ServiceRecord.findAll({
      attributes: [
        "cwo_id",
        [
          Sequelize.literal("SUM(service_mb_qty * service_rate)"),
          "service_budget",
        ],
      ],
      group: ["cwo_id"], // Group by cwo_id to aggregate data
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
      { where: { mwo_id } } // Fixed incorrect where clause syntax
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
    const expenses = req.body.expenses; // Expecting an array of expenses

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ message: "No expenses provided" });
    }
    // Validate each expense entry
    for (const expense of expenses) {
      const { cwo_id, mwo_id, service, expense_amount, uom, qty, vendor_name } =
        expense;

      if (
        !cwo_id ||
        !mwo_id ||
        !service ||
        !expense_amount ||
        !uom ||
        !qty ||
        !vendor_name
      ) {
        return res
          .status(400)
          .json({ message: "Missing required fields in one or more expenses" });
      }
    }

    // Insert multiple expenses at once using bulkCreate
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
      logging: console.log(),
    });

    console.log(`Total expense for MWO ${mwo_id}:`, totalExpense);
    res.json(totalExpense);
  } catch (error) {
    console.error("Error fetching total expense:", error);
    throw error;
  }
};

// Call the function (or export it)
module.exports = {
  findMaterialBudgets,
  findServiceBudgets,
  updateOverhead,
  addExpense,
  getTotalExpenseForMWO,
};
