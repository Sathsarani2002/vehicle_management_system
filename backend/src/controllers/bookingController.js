const Booking = require("../models/Booking");
const Customer = require("../models/Customer");

function mapBooking(booking) {
  return {
    id: booking._id.toString(),
    customerId: booking.customerId?.toString(),
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    phone: booking.phone,
    vehicleNumber: booking.vehicleNumber,
    serviceType: booking.serviceType,
    date: booking.date,
    time: booking.time,
    status: booking.status,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    transactionId: booking.transactionId,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

function canAccessBooking(user, booking) {
  if (user.role === "admin") {
    return true;
  }
  return booking.customerId.toString() === user.customerId;
}

async function listBookings(req, res) {
  const filter = req.user.role === "admin" ? {} : { customerId: req.user.customerId };
  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).lean();
  return res.json(bookings.map(mapBooking));
}

async function getBookingById(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (!canAccessBooking(req.user, booking)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json(mapBooking(booking));
}

async function createBooking(req, res) {
  const customer = await Customer.findById(req.user.customerId).lean();
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const {
    phone,
    vehicleNumber,
    serviceType,
    date,
    time,
    paymentMethod,
    paymentStatus,
    transactionId,
  } = req.body;

  if (!phone || !vehicleNumber || !serviceType || !date || !time) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  const normalizedPaymentMethod = paymentMethod || "Pay To The Center";
  const normalizedPaymentStatus = paymentStatus || (normalizedPaymentMethod === "Pay To The Center" ? "Unpaid" : "Paid");

  if (normalizedPaymentMethod !== "Pay To The Center" && !transactionId) {
    return res.status(400).json({ message: "Transaction/reference ID is required for non-cash payments" });
  }

  const booking = await Booking.create({
    customerId: customer._id,
    customerName: customer.name,
    customerEmail: customer.email,
    phone: String(phone).trim(),
    vehicleNumber: String(vehicleNumber).trim().toUpperCase(),
    serviceType: String(serviceType).trim(),
    date: String(date),
    time: String(time),
    paymentMethod: normalizedPaymentMethod,
    paymentStatus: normalizedPaymentStatus,
    transactionId: normalizedPaymentMethod === "Pay To The Center" ? "" : String(transactionId).trim(),
    status: "Pending",
  });

  return res.status(201).json(mapBooking(booking));
}

async function updateBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (!canAccessBooking(req.user, booking)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const allowedFields = req.user.role === "admin"
    ? ["customerName", "phone", "customerEmail", "vehicleNumber", "serviceType", "date", "time", "status", "paymentMethod", "paymentStatus", "transactionId"]
    : ["vehicleNumber", "serviceType", "date", "time", "paymentMethod", "paymentStatus", "transactionId"];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      booking[field] = req.body[field];
    }
  }

  booking.vehicleNumber = String(booking.vehicleNumber).trim().toUpperCase();

  if (booking.paymentMethod === "Pay To The Center") {
    booking.paymentStatus = "Unpaid";
    booking.transactionId = "";
  }

  await booking.save();
  return res.json(mapBooking(booking));
}

async function updateBookingStatus(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  booking.status = status;
  await booking.save();
  return res.json(mapBooking(booking));
}

async function cancelBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (!canAccessBooking(req.user, booking)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  booking.status = "Cancelled";
  await booking.save();
  return res.json(mapBooking(booking));
}

async function deleteBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  await booking.deleteOne();
  return res.json({ message: "Booking deleted successfully" });
}

module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
};
