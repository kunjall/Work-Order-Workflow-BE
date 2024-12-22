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

const MotherServiceRecord = sequelize.define(
  "MotherServiceRecord",
  {
    record_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
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
    service_wo_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_bal_qty: {
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
    mwo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mwo_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-mwo-service-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MotherServiceRecord,
};
