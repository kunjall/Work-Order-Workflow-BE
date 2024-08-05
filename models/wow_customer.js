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

const Customer = sequelize.define(
  "Customer",
  {
    customer_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_poc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_mobile: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customer_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_gstin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-customer",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  Customer,
};
