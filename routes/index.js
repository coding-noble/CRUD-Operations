const express = require("express");
const taskRoutes = require("./taskRoutes"); // Import task routes
const authRoutes = require("./authRoutes"); // Import auth routes

const router = express.Router();

// Register routes
router.use("/tasks", taskRoutes); // Task management routes
router.use("/auth", authRoutes);  // Authentication routes

module.exports = router;
