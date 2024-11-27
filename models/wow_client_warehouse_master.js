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

const ClientWarehouseMaster = sequelize.define(
  "ClientWarehouseMaster",
  {
    warehouse_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    warehouse_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    warehouse_company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-client-warehouse-master",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  ClientWarehouseMaster,
};
