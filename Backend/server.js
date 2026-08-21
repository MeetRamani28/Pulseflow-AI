const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "pulseflow-backend-gateway",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 Pulseflow Backend Gateway running on http://localhost:${PORT}`,
  );
  console.log(
    `🔗 Configured to route AI tasks to: ${process.env.AI_SERVICE_URL}`,
  );
});
