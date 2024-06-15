const express = require("express");
require("dotenv").config();
require("./utils/db");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors({ origin: process.env.URL }));
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/", userRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});
