const jwt = require("jsonwebtoken");
const tokenBlacklist = require("./tokenBlacklist");
require("dotenv").config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token ausente!" });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: "Token inválido (blacklist)!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token inválido!", error: err.message });
    }
    req.user = user;
    next();
  });
}

module.exports = authMiddleware;
