const express = require("express");
const { adminLogin, customerRegister, customerLogin, getMe } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/customer/register", customerRegister);
router.post("/customer/login", customerLogin);
router.get("/me", requireAuth, getMe);

module.exports = router;
