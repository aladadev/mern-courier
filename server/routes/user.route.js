const express = require("express");
const router = express.Router();

const UserValidators = require("../utils/validators/user.validator");
const UserController = require("../controllers/user.controller");
// Middleware
const { isAuthenticated } = require("../utils/middlewares/auth");

// Public routes
router.post("/register", UserValidators.register, UserController.register);
router.post("/login", UserValidators.login, UserController.login);

// Protected routes
router.get("/me", UserController.getUser);
router.post("/logout", UserController.logout);
router.post("/refresh", UserController.refreshAccessToken);

module.exports = router;
