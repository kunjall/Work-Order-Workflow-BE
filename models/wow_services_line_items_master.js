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

const ServicesMaster = sequelize.define(
  "ServicesMaster",
  {
    service_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    service_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_UOM: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_rate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-services-line-items-master",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  ServicesMaster,
};
