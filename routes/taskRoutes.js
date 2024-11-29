const express = require("express");
const router = express.Router();

const tasksController = require("../controllers/tasks.js");

router.get("/", tasksController.getAllTasks);
router.get("/:id", tasksController.getSingleTask);
router.post("/", tasksController.createTask);
router.put("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);

module.exports = router;