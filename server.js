const express = require("express");
require("dotenv").config();
require("./utils/db");

const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("running");
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
