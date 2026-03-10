const express = require("express");
const { listServices, createService, updateService, deleteService } = require("../controllers/serviceController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", listServices);
router.post("/", requireAuth, requireAdmin, createService);
router.put("/:id", requireAuth, requireAdmin, updateService);
router.delete("/:id", requireAuth, requireAdmin, deleteService);

module.exports = router;
