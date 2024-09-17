const express = require("express");
const router = express.Router();
const masterController = require("../controllers/master.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.get(
  "/master/find-material",
  authenticateUser,
  masterController.findMaterial
);

module.exports = router;
