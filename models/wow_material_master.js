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

const MaterialsMaster = sequelize.define(
  "MaterialsMaster",
  {
    item_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item_company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-material-master",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MaterialsMaster,
};
