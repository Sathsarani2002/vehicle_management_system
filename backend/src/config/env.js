const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:5173").trim(),
};
