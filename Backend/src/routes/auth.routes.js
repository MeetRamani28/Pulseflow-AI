const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authenticateToken = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validation.middleware");

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    validateRequest,
  ],
  authController.register,
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
  ],
  authController.login,
);

router.get("/me", authenticateToken, authController.getMe);

module.exports = router;
