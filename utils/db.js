const { Client } = require("pg");

const connString = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

connString
  .connect()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL database", err);
  });
