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

const ApprovalMatrix = sequelize.define(
  "ApprovalMatrix",
  {
    record_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approver_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reviewer_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reviewer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approver2_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approver2_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "wow-approval-matrix",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  ApprovalMatrix,
};
