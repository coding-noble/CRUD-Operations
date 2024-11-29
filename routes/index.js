const express = require("express");
const taskRoutes = require("./taskRoutes");
const userRoutes = require("./userRoutes");
const swaggerRoutes = require("./swaggerRoutes");

const router = express.Router();

// Register routes
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);
router.use("/", swaggerRoutes);

module.exports = router;
