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

const MbSheet = sequelize.define(
  "MbSheet",
  {
    mb_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
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
    gis_code: {
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
    mb_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mb_approver1_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mb_approver1_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mb_approver2_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mb_approver2_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mb_approver3_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mb_approver3_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mb_approver4_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mb_approver4_name: {
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
    attachment_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-mb-sheet",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MbSheet,
};
