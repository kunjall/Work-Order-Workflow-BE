const { User } = require("../models/wow_user_login");

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

module.exports = {
  findUser,
};
