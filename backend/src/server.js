const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { connectDatabase, disconnectDatabase } = require("./config/db");

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: "mongo",
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found",
  });
});

app.use((error, _req, res, _next) => {
  const status =
    error.status ||
    (error.name === "ValidationError" ? 400 : 500);

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : error.message,
  });
});

async function startServer() {
  await connectDatabase();

  return app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

async function shutdown(server) {
  await disconnectDatabase();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  process.exit(0);
}

if (require.main === module) {
  startServer()
    .then((server) => {
      process.once("SIGINT", () => shutdown(server));
      process.once("SIGTERM", () => shutdown(server));
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    });
}

module.exports = app;
