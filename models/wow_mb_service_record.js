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

const MbService = sequelize.define(
  "MbService",
  {
    record_id: {
      type: DataTypes.STRING,
      primaryKey: true,
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
    service_unit_price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_log_qty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_price: {
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
    mb_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-mb-service-record",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MbService,
};
