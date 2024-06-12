const { User } = require("../models/wow_user_login");

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.json({ error: "User does not exist" });
    }
    if (password !== user.password) {
      return res.json({ error: "Invalid password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "User account is not active." });
    }

    return res.json({ role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loginUser,
};
