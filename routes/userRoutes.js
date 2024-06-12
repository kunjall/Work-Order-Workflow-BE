// jobRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.js");
const loginController = require("../controllers/login.js");

router.get("/user/findUser", userController.findUser);
router.post("/user/loginUser", loginController.loginUser);

module.exports = router;
