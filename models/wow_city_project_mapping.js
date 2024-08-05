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

const CityProject = sequelize.define(
  "CityProject",
  {
    city_manager_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      autoIncrement: true,
    },
    city_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manager_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-city-project-mapping",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  CityProject,
};
