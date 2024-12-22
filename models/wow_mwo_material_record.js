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

const MotherMaterialRecord = sequelize.define(
  "MotherMaterialRecord",
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
    material_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_wo_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_bal_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mwo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mwo_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_rate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-mwo-material-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MotherMaterialRecord,
};
