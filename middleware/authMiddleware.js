const jwt = require("jsonwebtoken");
const { invalidatedTokens } = require("../controllers/login");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader;

  try {
    if (invalidatedTokens.has(token)) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token has been invalidated" });
    }

    const secretKey = process.env.SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);

    req.user = { userId: decoded.userId, role: decoded.role };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticateUser;
