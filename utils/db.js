const { Client } = require("pg");
const { Sequelize } = require("sequelize");

const connString = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

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
connString
  .connect()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL database", err);
  });

module.exports = sequelize;
