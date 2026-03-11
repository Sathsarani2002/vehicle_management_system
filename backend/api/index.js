const app = require("../src/app");
const { connectDatabase } = require("../src/config/db");
const { ensureDefaults } = require("../src/seed/defaultData");

let bootstrapPromise;

async function bootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDatabase();
      await ensureDefaults();
    })();
  }

  return bootstrapPromise;
}

module.exports = async (req, res) => {
  try {
    await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error("Backend bootstrap failed", error);
    return res.status(500).json({
      message: "Backend startup failed",
      details: error.message,
    });
  }
};
