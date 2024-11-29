const express = require("express");
const router = express.Router();

const tasksController = require("../controllers/tasks.js");
const { isAuthenticated } = require("../middleware/authentication.js")

router.get("/", tasksController.getAllTasks);
router.get("/:id", tasksController.getSingleTask);
router.post("/", isAuthenticated, tasksController.createTask);
router.put("/:id", isAuthenticated, tasksController.updateTask);
router.delete("/:id", isAuthenticated, tasksController.deleteTask);

module.exports = router;