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

const MaterialRecord = sequelize.define(
  "MaterialRecord",
  {
    record_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    mwo_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mwo_id: {
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
    material_bal_qty: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    material_mb_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vendor_id: {
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
    material_price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "wow-cwo-material-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MaterialRecord,
};
