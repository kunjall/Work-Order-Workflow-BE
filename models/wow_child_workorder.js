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

const ChildWorkorder = sequelize.define(
  "ChildWorkorder",
  {
    workorder_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true, // NULL is allowed according to your table definition
    },
    vendor_id: {
      type: DataTypes.STRING,
      allowNull: true, // NULL is allowed according to your table definition
    },
    vendor_route_allocation: {
      type: DataTypes.STRING,
      allowNull: true, // NULL is allowed according to your table definition
    },
    total_service_cost: {
      type: DataTypes.DECIMAL, // Matches the numeric type in the table
      allowNull: true, // NULL is allowed according to your table definition
    },
    internal_manager: {
      type: DataTypes.STRING,
      allowNull: true, // NULL is allowed according to your table definition
    },
  },
  {
    tableName: "wow-child-workorder",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  ChildWorkorder,
};
