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

const MmMaterial = sequelize.define(
  "MmMaterial",
  {
    record_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    material_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_desc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_unit_price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_req_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_provided_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    material_received_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_cwo_bal_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_free_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mm_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locator_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cwo_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cwo_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-mm-material-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MmMaterial,
};
