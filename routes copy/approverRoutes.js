const express = require("express");
const router = express.Router();
const approvalController = require("../controllers/approver.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.get(
  "/approver/find-reviewers",
  authenticateUser,
  approvalController.findReviewer
);

module.exports = router;
