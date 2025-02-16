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

const InventoryStock = sequelize.define(
  "InventoryStock",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: false, // Change to `true` if `id` is auto-incremented
    },
    material_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Material ID",
    },
    material_stock: {
      type: DataTypes.NUMERIC,
      allowNull: true,
      comment: "Material Stock Quantity",
    },
    material_desc: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Material Description",
    },
    material_uom: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Material Unit of Measure",
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Company",
    },
    material_rate: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Material Rate",
    },
    warehouse_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Warehouse Id",
    },
  },
  {
    tableName: "wow-inventory-stock",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  InventoryStock,
};
