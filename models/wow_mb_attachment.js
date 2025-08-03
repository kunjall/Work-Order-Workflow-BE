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

const MbAttachment = sequelize.define(
  "MbAttachment",
  {
    attachment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Sequelize handles GENERATED ALWAYS AS IDENTITY
    },
    mb_id: {
      type: DataTypes.STRING, // equivalent to character varying
      collate: 'pg_catalog."default"', // optional; usually not needed unless explicitly required
    },
    attachment: {
      type: DataTypes.BLOB, // equivalent to bytea
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "wow-mb-attachment",
    schema: "WOW",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  MbAttachment,
};
