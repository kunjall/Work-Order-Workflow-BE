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

const MotherWorkorder = sequelize.define(
  "MotherWorkorder",
  {
    mwo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      field: "mwo_id",
    },
    mwo_number: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    workorder_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.STRING,
      allowNull: true, // Adjust according to your requirements
    },

    gis_code: {
      type: DataTypes.STRING,
      allowNull: true, // Adjust according to your requirements
    },
    route_name: {
      type: DataTypes.STRING,
      allowNull: true, // Adjust according to your requirements
    },
    homepass_count: {
      type: DataTypes.BIGINT,
      allowNull: true, // Adjust according to your requirements
    },
    activity: {
      type: DataTypes.STRING,
      allowNull: true, // Adjust according to your requirements
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true, // Adjust according to your requirements
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE, // Changed from STRING to DATE
      allowNull: true,
    },
    mwo_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    route_length: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    execution_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_approval_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    customer_project_manager: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_service_cost: {
      type: DataTypes.DECIMAL, // Matches the numeric type in the table
      allowNull: true, // NULL is allowed according to your table definition
    },
    total_material_cost: {
      type: DataTypes.DECIMAL, // Matches the numeric type in the table
      allowNull: true, // NULL is allowed according to your table definition
    },
    customer_state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mwo_approver_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mwo_approver_name: {
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
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bal_material_cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bal_service_cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    overhead_budget: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mwo_approver1_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mwo_approver1_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mwo_approver2_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mwo_approver2_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-mother-workorder",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MotherWorkorder,
};
