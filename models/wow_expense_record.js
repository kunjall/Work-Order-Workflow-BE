const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

const ExpenseRecord = sequelize.define(
  "ExpenseRecord",
  {
    expense_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cwo_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mwo_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expense_amount: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoice_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-expense-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  ExpenseRecord,
};
