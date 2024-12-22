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

const ServiceRecord = sequelize.define(
  "ServiceRecord",
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
    service_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_desc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_bal_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_wo_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_rate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cwo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cwo_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-cwo-service-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  ServiceRecord,
};
