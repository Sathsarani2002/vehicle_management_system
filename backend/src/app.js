const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { frontendUrl } = require("./config/env");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
