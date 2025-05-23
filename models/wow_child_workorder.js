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
    cwo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      field: "cwo_id",
    },
    cwo_number: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    mwo_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    mwo_number: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    vendor_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_route_allocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_service_cost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    internal_manager: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    execution_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    workorder_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_material_cost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    cwo_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cwo_approver_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cwo_approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approver_comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    route_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gis_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    homepass_count: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activity: {
      type: DataTypes.STRING,
      allowNull: true,
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
