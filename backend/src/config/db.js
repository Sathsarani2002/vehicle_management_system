const mongoose = require("mongoose");
const { mongoUri } = require("./env");

async function connectDatabase() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to your backend .env file.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

module.exports = { connectDatabase };
