const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceCategory", serviceCategorySchema);
