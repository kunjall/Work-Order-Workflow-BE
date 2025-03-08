const { User } = require("../models/wow_user_login");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const findUser = async (req, res) => {
  try {
    const foundUser = await User.findOne({
      where: { username: "kunjallal.click@gmail.com" },
    });
    res.json(foundUser);
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    const foundUser = await User.findOne({
      where: { username },
    });

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    foundUser.password = hashedPassword;
    await foundUser.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, role, name, company } = req.body;
    const defaultPassword = "Welcome123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      status: "active",
      name,
      company,
    });

    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { username } = req.body;

    const foundUser = await User.findOne({ where: { username } });
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const randomPassword = crypto.randomBytes(5).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    await User.update({ password: hashedPassword }, { where: { username } });

    res.json({
      message: "Password reset successfully",
      newPassword: randomPassword,
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  findUser,
  changePassword,
  createUser,
  resetPassword,
};
