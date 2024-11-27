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

const InventoryInward = sequelize.define(
  "InventoryInward",
  {
    customer_dc_number: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true, // This field is the primary key
    },
    customer_id: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    warehouse_id: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    warehouse_city: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    entry_date: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    dc_date: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    eway_bill_number: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    mrs_number: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    mrs_date: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    client_warehouse_id: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, as this column allows NULL
    },
    client_warehouse_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-inventory-inward",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  InventoryInward,
};
