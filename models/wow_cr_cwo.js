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

const CrCwo = sequelize.define(
  "CrCwo",
  {
    cr_cwo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: "cr_cwo_id",
    },
    cwo_number: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cwo_number",
    },
    total_service_cost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: "total_service_cost",
    },
    total_material_cost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: "total_material_cost",
    },
    cr_status: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cr_status",
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "customer_name",
    },
    cr_approver_email: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cr_approver_email",
    },
    cr_approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cr_approver_name",
    },
    cr_approver2_email: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cr_approver2_email",
    },
    cr_approver2_name: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cr_approver2_name",
    },
    actioned_by: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "actioned_by",
    },
    actioned_at: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "actioned_at",
    },
    approver_comments: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "approver_comments",
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "created_by",
    },
    created_at: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "created_at",
    },
    cwo_id: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cwo_id",
    },
  },
  {
    tableName: "wow-cr-cwo",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  CrCwo,
};
