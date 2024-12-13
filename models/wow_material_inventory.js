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

const MaterialInventory = sequelize.define(
  "MaterialInventory",
  {
    record_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customer_dc_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_desc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_wo_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-material-inventory",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MaterialInventory,
};
