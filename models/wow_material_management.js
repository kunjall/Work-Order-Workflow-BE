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

const MaterialManagement = sequelize.define(
  "MaterialManagement",
  {
    mm_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    warehouse_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tps_pm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    execution_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    route_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    internal_external: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locator_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tps_dc_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mm_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mm_approver1_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mm_approver1_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mm_approver2_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mm_approver2_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mm_approver3_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mm_approver3_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actioned_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actioned_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approver_comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requested_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requested_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cwo_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cwo_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transaction_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_dc_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    intracity_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    tps_dc_date: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: "wow-material-management",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MaterialManagement,
};
