const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "pulseflow-backend" });
});

const startServer = async () => {
  await setupDatabase();

  server.listen(PORT, () => {
    console.log(
      `🚀 Pulseflow Backend Gateway running on http://localhost:${PORT}`,
    );
    console.log(
      `🛡️  Security active: CORS strict, Helmet enabled, Rate Limiting applied.`,
    );
  });
};

startServer();
