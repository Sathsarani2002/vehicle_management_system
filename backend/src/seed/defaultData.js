const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const ServiceCategory = require("../models/ServiceCategory");

const defaultServices = [
  { name: "General Service", description: "Regular vehicle maintenance and inspection" },
  { name: "Oil Change", description: "Engine oil and filter replacement" },
  { name: "Brake Service", description: "Brake pads and fluid check" },
  { name: "Tire Service", description: "Tire rotation, alignment, and balancing" },
  { name: "AC Repair", description: "Air conditioning system repair and maintenance" },
  { name: "Engine Diagnostics", description: "Complete engine check and diagnostics" },
];

async function ensureDefaults() {
  const adminExists = await Admin.findOne({ username: "admin" });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await Admin.create({ username: "admin", passwordHash, name: "System Admin" });
  }

  const demoCustomerEmail = "demo@vehicle.com";
  const demoCustomer = await Customer.findOne({ email: demoCustomerEmail });
  if (!demoCustomer) {
    const passwordHash = await bcrypt.hash("demo123", 10);
    await Customer.create({
      name: "Demo Customer",
      phone: "+94 77 123 4567",
      email: demoCustomerEmail,
      passwordHash,
    });
  }

  const serviceCount = await ServiceCategory.countDocuments();
  if (serviceCount === 0) {
    await ServiceCategory.insertMany(defaultServices);
  }
}

module.exports = { ensureDefaults };
