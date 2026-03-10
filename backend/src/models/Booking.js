const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
    serviceType: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Completed", "Rejected", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Pay To The Center", "Bank Deposit", "Online Transfer"],
      default: "Pay To The Center",
    },
    paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    transactionId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
