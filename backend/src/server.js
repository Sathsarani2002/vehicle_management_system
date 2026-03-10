const app = require("./app");
const { port } = require("./config/env");
const { connectDatabase } = require("./config/db");
const { ensureDefaults } = require("./seed/defaultData");

async function startServer() {
  try {
    await connectDatabase();
    await ensureDefaults();

    app.listen(port, () => {
      console.log(`Backend server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend server", error);
    process.exit(1);
  }
}

startServer();
