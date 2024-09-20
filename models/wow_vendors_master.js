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

const VendorsMaster = sequelize.define(
  "VendorsMaster",
  {
    vendor_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_gst_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_pan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-vendor-master",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  VendorsMaster,
};
