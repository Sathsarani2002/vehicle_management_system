const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const { generateToken } = require("../utils/generateToken");

function toCustomerPublic(customer) {
  return {
    id: customer._id.toString(),
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    createdAt: customer.createdAt,
  };
}

async function adminLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const admin = await Admin.findOne({ username: username.trim().toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken({ role: "admin", adminId: admin._id.toString(), username: admin.username });
  return res.json({
    token,
    admin: {
      id: admin._id.toString(),
      username: admin.username,
      name: admin.name,
    },
  });
}

async function customerRegister(req, res) {
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    return res.status(400).json({ message: "Name, phone, email, and password are required" });
  }

  if (String(password).trim().length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingCustomer = await Customer.findOne({ email: normalizedEmail });
  if (existingCustomer) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await Customer.create({
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = generateToken({ role: "customer", customerId: customer._id.toString(), email: customer.email });

  return res.status(201).json({
    token,
    customer: toCustomerPublic(customer),
  });
}

async function customerLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const customer = await Customer.findOne({ email: normalizedEmail });
  if (!customer) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isValid = await bcrypt.compare(password, customer.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken({ role: "customer", customerId: customer._id.toString(), email: customer.email });

  return res.json({
    token,
    customer: toCustomerPublic(customer),
  });
}

async function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role === "admin") {
    const admin = await Admin.findById(req.user.adminId).lean();
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    return res.json({
      role: "admin",
      admin: {
        id: String(admin._id),
        username: admin.username,
        name: admin.name,
      },
    });
  }

  const customer = await Customer.findById(req.user.customerId).lean();
  if (!customer) {
    return res.status(401).json({ message: "Customer not found" });
  }

  return res.json({
    role: "customer",
    customer: {
      id: String(customer._id),
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      createdAt: customer.createdAt,
    },
  });
}

module.exports = {
  adminLogin,
  customerRegister,
  customerLogin,
  getMe,
};
