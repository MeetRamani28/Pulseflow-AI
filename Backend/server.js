const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const { setupDatabase } = require("./src/models/db");
const { initSocket } = require("./src/sockets/socket");
require("./src/queue/taskQueue");
const authRoutes = require("./src/routes/auth.routes");
const taskRoutes = require("./src/routes/task.routes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

initSocket(server);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "pulseflow-backend-gateway",
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  await setupDatabase();

  server.listen(PORT, () => {
    console.log(
      `🚀 Pulseflow Backend Gateway running on http://localhost:${PORT}`,
    );
    console.log(
      `🔗 Configured to route AI tasks to: ${process.env.AI_SERVICE_URL}`,
    );
    console.log(`📦 BullMQ Worker initialized and waiting for Redis jobs.`);
  });
};

startServer();
