const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.get(
  "/customer/findCustomer",
  authenticateUser,
  customerController.findCustomer
);
router.get("/customer/findCity", authenticateUser, customerController.findCity);
module.exports = router;
