const { Queue, Worker } = require("bullmq");
const Redis = require("ioredis");
const axios = require("axios");
const Task = require("../models/task.model");
const { getIo } = require("../sockets/socket");

const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

const taskQueue = new Queue("ai-tasks", { connection });

const worker = new Worker(
  "ai-tasks",
  async (job) => {
    const { type, threadId, userId, payload } = job.data;

    try {
      let aiResponse;

      if (type === "create") {
        aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/task`, {
          thread_id: threadId,
          task: payload.task,
        });
      } else if (type === "resume") {
        aiResponse = await axios.post(
          `${process.env.AI_SERVICE_URL}/task/resume`,
          {
            thread_id: threadId,
            approved: payload.approved,
          },
        );
      }

      let status = "completed";
      let resultText = aiResponse.data.final_response;

      if (aiResponse.data.status === "paused_for_hitl") {
        status = "paused_for_hitl";
        resultText = aiResponse.data.message;
      }

      const updatedTask = await Task.updateStatus(threadId, status, resultText);

      try {
        getIo().to(`user_${userId}`).emit("task_update", updatedTask);
      } catch (err) {
        console.error("Socket broadcast failed:", err.message);
      }

      return { status, resultText };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      const failedTask = await Task.updateStatus(
        threadId,
        "failed",
        errorMessage,
      );

      try {
        getIo().to(`user_${userId}`).emit("task_update", failedTask);
      } catch (err) {
        console.error("Socket broadcast failed:", err.message);
      }

      throw error;
    }
  },
  { connection },
);

worker.on("failed", (job, err) => {
  console.error(`❌ Background Job ${job.id} failed:`, err.message);
});

worker.on("completed", (job, returnvalue) => {
  console.log(
    `✅ Background Job ${job.id} completed. Status: ${returnvalue.status}`,
  );
});

module.exports = { taskQueue };
