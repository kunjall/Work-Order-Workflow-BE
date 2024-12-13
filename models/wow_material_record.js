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

    workorder_id: {
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
    vendor_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-material-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MaterialRecord,
};
