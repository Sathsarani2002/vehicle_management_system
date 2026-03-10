const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const Booking = require("../models/Booking");

function mapCustomer(customer) {
  return {
    id: customer._id.toString(),
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    createdAt: customer.createdAt,
  };
}

async function listCustomers(req, res) {
  const customers = await Customer.find().sort({ createdAt: -1 }).lean();
  return res.json(customers.map(mapCustomer));
}

async function updateCustomer(req, res) {
  const { id } = req.params;
  const { name, phone, email, password } = req.body;

  const customer = await Customer.findById(id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  if (email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await Customer.findOne({ email: normalizedEmail, _id: { $ne: id } });
    if (existing) {
      return res.status(409).json({ message: "Another user already uses this email address" });
    }
    customer.email = normalizedEmail;
  }

  if (name) {
    customer.name = String(name).trim();
  }

  if (phone) {
    customer.phone = String(phone).trim();
  }

  if (password && String(password).trim()) {
    customer.passwordHash = await bcrypt.hash(String(password).trim(), 10);
  }

  await customer.save();

  // Keep booking snapshots aligned with updated profile fields.
  await Booking.updateMany(
    { customerId: customer._id },
    {
      $set: {
        customerName: customer.name,
        customerEmail: customer.email,
        phone: customer.phone,
      },
    }
  );

  return res.json(mapCustomer(customer));
}

async function deleteCustomer(req, res) {
  const { id } = req.params;

  const customer = await Customer.findById(id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  if (customer.email === "demo@vehicle.com") {
    return res.status(400).json({ message: "Demo customer cannot be deleted" });
  }

  await Booking.deleteMany({ customerId: customer._id });
  await customer.deleteOne();

  return res.json({ message: "Customer deleted successfully" });
}

module.exports = {
  listCustomers,
  updateCustomer,
  deleteCustomer,
};
