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

const Supplier = sequelize.define(
  "Supplier",
  {
    supplier_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    supplier_name: {
      type: DataTypes.STRING,
    },
    supplier_state: {
      type: DataTypes.STRING,
    },
    supplier_pincode: {
      type: DataTypes.STRING,
    },
    supplier_address: {
      type: DataTypes.STRING,
    },
    supplier_poc: {
      type: DataTypes.STRING,
    },
    supplier_mobile: {
      type: DataTypes.STRING,
    },
    supplier_email: {
      type: DataTypes.STRING,
    },
    supplier_gstin: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "wow-supplier-master",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  Supplier,
};
