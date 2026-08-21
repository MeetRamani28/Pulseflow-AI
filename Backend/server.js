const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { setupDatabase } = require("./src/models/db");
const authRoutes = require('./src/routes/auth.routes');
const taskRoutes = require('./src/routes/task.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/tasks', taskRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "pulseflow-backend-gateway",
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  await setupDatabase();

  app.listen(PORT, () => {
    console.log(
      `🚀 Pulseflow Backend Gateway running on http://localhost:${PORT}`,
    );
    console.log(
      `🔗 Configured to route AI tasks to: ${process.env.AI_SERVICE_URL}`,
    );
  });
};

startServer();
