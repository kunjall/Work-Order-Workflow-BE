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

const WarehouseMaster = sequelize.define(
  "WarehouseMaster",
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
  },
  {
    tableName: "wow-warehouse-master",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  WarehouseMaster,
};
