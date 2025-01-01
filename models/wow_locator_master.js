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

const LocatorMaster = sequelize.define(
  "LocatorMaster",
  {
    id: {
      type: DataTypes.NUMERIC,
      primaryKey: true,
      allowNull: false,
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locator_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    internal_external: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow_locator_master",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  LocatorMaster,
};
