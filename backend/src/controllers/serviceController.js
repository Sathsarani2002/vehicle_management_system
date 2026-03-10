const ServiceCategory = require("../models/ServiceCategory");

function mapService(service) {
  return {
    id: service._id.toString(),
    name: service.name,
    description: service.description,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

async function listServices(req, res) {
  const services = await ServiceCategory.find().sort({ createdAt: 1 }).lean();
  return res.json(services.map(mapService));
}

async function createService(req, res) {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required" });
  }

  const exists = await ServiceCategory.findOne({ name: String(name).trim() });
  if (exists) {
    return res.status(409).json({ message: "Service category already exists" });
  }

  const service = await ServiceCategory.create({
    name: String(name).trim(),
    description: String(description).trim(),
  });

  return res.status(201).json(mapService(service));
}

async function updateService(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  const service = await ServiceCategory.findById(id);
  if (!service) {
    return res.status(404).json({ message: "Service category not found" });
  }

  if (name) {
    service.name = String(name).trim();
  }

  if (description) {
    service.description = String(description).trim();
  }

  await service.save();
  return res.json(mapService(service));
}

async function deleteService(req, res) {
  const { id } = req.params;
  const service = await ServiceCategory.findById(id);
  if (!service) {
    return res.status(404).json({ message: "Service category not found" });
  }

  await service.deleteOne();
  return res.json({ message: "Service category deleted successfully" });
}

module.exports = {
  listServices,
  createService,
  updateService,
  deleteService,
};
