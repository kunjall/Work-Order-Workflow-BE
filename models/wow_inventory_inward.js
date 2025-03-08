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

const InventoryInward = sequelize.define(
  "InventoryInward",
  {
    inventory_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      field: "inventory_id",
    },
    customer_dc_number: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "customer_dc_number",
    },
    customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    warehouse_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    warehouse_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    entry_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dc_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    eway_bill_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mrs_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mrs_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    client_warehouse_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    client_warehouse_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inventory_inward_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inventory_approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inventory_receiver_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inventory_receiver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inventory_approver_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    received_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    received_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiver_comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approver_comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-inventory-inward",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  InventoryInward,
};
