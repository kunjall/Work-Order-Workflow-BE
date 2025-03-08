const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.js");
const loginController = require("../controllers/login.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.get("/user/findUser", userController.findUser);
router.post("/user/create", userController.createUser);

router.post("/user/change-password", userController.changePassword);
router.post("/user/reset-password", userController.resetPassword);

router.post("/user/loginUser", loginController.loginUser);
router.post("/user/logout", authenticateUser, loginController.logoutUser);
router.get(
  "/user/validateToken",
  authenticateUser,
  loginController.validateToken
);

module.exports = router;
