const express = require("express");
const router = express.Router();
const mmController = require("../controllers/materialManagement.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.get(
  "/mm/find-material-stock",
  authenticateUser,
  mmController.findMaterialStock
);

router.post("/mm/create-mm", authenticateUser, mmController.createMM);

module.exports = router;
