const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const authenticateToken = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validation.middleware");

router.use(authenticateToken);

router.post(
  "/",
  [
    body("task")
      .isString()
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Task description is required"),
    validateRequest,
  ],
  taskController.createTask,
);

router.post(
  "/resume",
  [
    body("threadId").isUUID().withMessage("Must be a valid UUID"),
    body("approved")
      .isBoolean()
      .withMessage("Approved must be a boolean true/false"),
    validateRequest,
  ],
  taskController.resumeTask,
);

router.get("/", taskController.getUserTasks);

module.exports = router;
