const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Task = require("../models/task.model");

exports.createTask = async (req, res) => {
  try {
    const { task } = req.body;
    const userId = req.user.id;

    if (!task)
      return res.status(400).json({ error: "Task description is required." });

    const threadId = uuidv4();

    const newTask = await Task.create(userId, threadId, task);

    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/task`,
        {
          thread_id: threadId,
          task: task,
        },
      );

      let status = "completed";
      let resultText = aiResponse.data.final_response;

      if (aiResponse.data.status === "paused_for_hitl") {
        status = "paused_for_hitl";
        resultText = aiResponse.data.message;
      }

      const updatedTask = await Task.updateStatus(threadId, status, resultText);
      return res
        .status(201)
        .json({ message: "Task processed", task: updatedTask });
    } catch (aiError) {
      const errorMessage = aiError.response?.data?.detail || aiError.message;
      const failedTask = await Task.updateStatus(
        threadId,
        "failed",
        errorMessage,
      );
      return res
        .status(500)
        .json({ error: "AI Service failed", task: failedTask });
    }
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.resumeTask = async (req, res) => {
  try {
    const { threadId, approved } = req.body;

    if (!threadId || typeof approved !== "boolean") {
      return res
        .status(400)
        .json({ error: "threadId and boolean approved flag are required." });
    }

    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/task/resume`,
        {
          thread_id: threadId,
          approved: approved,
        },
      );

      const updatedTask = await Task.updateStatus(
        threadId,
        "completed",
        aiResponse.data.final_response,
      );
      return res
        .status(200)
        .json({ message: "Task resumed", task: updatedTask });
    } catch (aiError) {
      const errorMessage = aiError.response?.data?.detail || aiError.message;
      const failedTask = await Task.updateStatus(
        threadId,
        "failed",
        errorMessage,
      );
      return res
        .status(500)
        .json({ error: "AI Service failed during resume", task: failedTask });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.findAllByUser(req.user.id);
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
