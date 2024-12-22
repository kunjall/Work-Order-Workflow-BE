// db.js or sequelize.js (where you define your Sequelize instance)
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: "localhost", // Specify the host if needed
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  dialect: "postgres", // Specify the dialect
  logging: false, // Optionally turn off SQL logging
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to PostgreSQL using Sequelize");
  })
  .catch((err) => {
    console.error(
      "Error connecting to PostgreSQL database using Sequelize",
      err
    );
  });

// Export sequelize to use it in other files
module.exports = sequelize;
