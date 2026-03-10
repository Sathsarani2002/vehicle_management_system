const express = require("express");
const {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const { requireAuth, requireAdmin, requireCustomer } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", listBookings);
router.get("/:id", getBookingById);
router.post("/", requireCustomer, createBooking);
router.put("/:id", updateBooking);
router.patch("/:id/status", requireAdmin, updateBookingStatus);
router.patch("/:id/cancel", cancelBooking);
router.delete("/:id", requireAdmin, deleteBooking);

module.exports = router;
