const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
}

module.exports = { generateToken };
