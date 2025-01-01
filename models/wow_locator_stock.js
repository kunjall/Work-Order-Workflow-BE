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

const LocatorStock = sequelize.define(
  "LocatorStock",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    locator_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stock_qty: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
  },
  {
    tableName: "wow-locator-stock",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  LocatorStock,
};
