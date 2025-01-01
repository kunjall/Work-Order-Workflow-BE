const express = require("express");
require("dotenv").config();
require("./utils/db");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const workorderRoutes = require("./routes/workorderRoutes");
const masterRoutes = require("./routes/masterRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const approvalRoutes = require("./routes/approverRoutes");
const mmRoutes = require("./routes/mmRoutes");

const app = express();

app.use(cors({ origin: process.env.URL }));
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/", userRoutes);
app.use("/", workorderRoutes);
app.use("/", masterRoutes);
app.use("/", inventoryRoutes);
app.use("/", approvalRoutes);
app.use("/", mmRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});
