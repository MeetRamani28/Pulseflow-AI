const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const authenticateToken = require("../middleware/auth.middleware");

router.use(authenticateToken);

router.post("/", taskController.createTask);
router.post("/resume", taskController.resumeTask);
router.get("/", taskController.getUserTasks);

module.exports = router;
