const { v4: uuidv4 } = require("uuid");
const Task = require("../models/task.model");
const { taskQueue } = require("../queue/taskQueue");

exports.createTask = async (req, res) => {
  try {
    const { task } = req.body;
    const userId = req.user.id;

    if (!task)
      return res.status(400).json({ error: "Task description is required." });

    const threadId = uuidv4();
    const newTask = await Task.create(userId, threadId, task);

    await taskQueue.add("execute-task", {
      type: "create",
      threadId,
      userId,
      payload: { task },
    });

    return res
      .status(201)
      .json({ message: "Task queued for execution", task: newTask });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.resumeTask = async (req, res) => {
  try {
    const { threadId, approved } = req.body;
    const userId = req.user.id;

    if (!threadId || typeof approved !== "boolean") {
      return res
        .status(400)
        .json({ error: "threadId and boolean approved flag are required." });
    }

    await Task.updateStatus(threadId, "pending", "Resuming task execution...");

    await taskQueue.add("resume-task", {
      type: "resume",
      threadId,
      userId,
      payload: { approved },
    });

    return res.status(200).json({ message: "Task resume queued" });
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
