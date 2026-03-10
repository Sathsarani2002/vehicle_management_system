const express = require("express");
const { listCustomers, updateCustomer, deleteCustomer } = require("../controllers/customerController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", listCustomers);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;
