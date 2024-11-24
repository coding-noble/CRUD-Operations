const express = require("express");
const path = require("path");
const router = express.Router();

// Importing the tasksController which contains the logic for handling requests
const tasksController = require(path.join("..", "controllers", "tasks.js"));

// GET Route to get all tasks
router.get("/", tasksController.getAllTasks);

// GET Route to get a single task by ID
router.get("/:id", tasksController.getSingleTask);

// POST Route to create a new task
router.post("/", tasksController.createTask);

// PUT Route to update a task by ID
router.put("/:id", tasksController.updateTask);

// DELETE Route to delete a task by ID
router.delete("/:id", tasksController.deleteTask);

// Export the router so it can be used elsewhere
module.exports = router;