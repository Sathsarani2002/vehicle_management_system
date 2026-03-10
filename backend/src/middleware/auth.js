const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}

function requireCustomer(req, res, next) {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({ message: "Customer access required" });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin, requireCustomer };
