const { User } = require("../models/wow_user_login");
const jwt = require("jsonwebtoken");

const invalidatedTokens = new Set();

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    if (password !== user.password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "User account is not active." });
    }

    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign({ userId: user.id, role: user.role }, secretKey, {
      expiresIn: "1h",
    });

    return res.json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    if (invalidatedTokens.has(token)) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token has already been invalidated" });
    }

    const secretKey = process.env.SECRET_KEY;
    jwt.verify(token, secretKey, (err) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      // Add token to invalidated set
      invalidatedTokens.add(token);
      console.log("success");
      res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const validateToken = (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.replace("Bearer ", "");
  const secretKey = process.env.SECRET_KEY;

  if (invalidatedTokens.has(token)) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Token has been invalidated" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = {
  loginUser,
  logoutUser,
  validateToken,
  invalidatedTokens,
};
