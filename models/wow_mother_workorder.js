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
    workorder_id: {
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
    workorder_number: {
      type: DataTypes.STRING,
      allowNull: true,
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
    workorder_status: {
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
    customer_state: {
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
