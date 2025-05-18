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

const CrCwoServiceRecord = sequelize.define(
  "CrCwoServiceRecord",
  {
    record_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    cwo_id: {
      type: DataTypes.STRING,
    },
    cwo_number: {
      type: DataTypes.STRING,
    },
    cr_id: {
      type: DataTypes.STRING,
    },
    service_id: {
      type: DataTypes.STRING,
    },
    service_desc: {
      type: DataTypes.STRING,
    },
    service_unit_price: {
      type: DataTypes.STRING,
    },
    service_uom: {
      type: DataTypes.STRING,
    },
    service_cr_qty: {
      type: DataTypes.STRING,
    },
    service_old_qty: {
      type: DataTypes.STRING,
    },
    is_removed: {
      type: DataTypes.BOOLEAN,
    },
    is_added: {
      type: DataTypes.BOOLEAN,
    },
    old_amount: {
      type: DataTypes.STRING,
    },
    cr_amount: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "wow-cr-cwo-service-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  CrCwoServiceRecord,
};
