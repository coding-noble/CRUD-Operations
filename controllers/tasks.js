// controllers/tasks.js
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../data/database");

// Get all tasks
const getAllTasks = async (req, res) => {
    const db = getDatabase();
    try {
        const tasks = await db.collection("tasks").find().toArray();
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
};

// Get a single task by ID
const getSingleTask = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    try {
        const task = await db.collection("tasks").findOne({ _id: new ObjectId(id) });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch task" });
    }
};

// Create a new task
const createTask = async (req, res) => {
    const db = getDatabase();
    const { title, description, createdAt } = req.body;

    // Check if required fields are provided
    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }

    try {
        // Create the new task object
        const newTask = {
            title,
            description,
            completed: false, // Default status
            createdAt: createdAt ? new Date(createdAt) : new Date(), // Use provided date or current date
        };

        // Insert the task into the database
        const result = await db.collection("tasks").insertOne(newTask);

        // Check if the task was inserted correctly
        if (result.insertedId) {
            // If task was created, return the newly created task with the insertedId
            const createdTask = { ...newTask, _id: result.insertedId };
            return res.status(201).json(createdTask);
        } else {
            // If no insertedId, something went wrong
            throw new Error("Failed to insert task.");
        }
    } catch (err) {
        console.error("Error creating task:", err);  // Log the error for debugging
        res.status(500).json({ error: `Failed to create task: ${err.message}` });
    }
};

// Update a task by ID
const updateTask = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params; // Extract the task ID from the URL parameters
    const { title, description, completed } = req.body; // Get new task data from request body

    try {
        // Find the task by ID
        const task = await db.collection("tasks").findOne({ _id: new ObjectId(id) });

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Prepare the updated task object
        const updatedTask = {
            ...task, // Keep the existing fields
            title: title || task.title, // If title is provided, update it; otherwise, keep the current one
            description: description || task.description, // Same for description
            completed: completed !== undefined ? completed : task.completed, // If completed is provided, update it; otherwise, keep the current value
        };

        // Update the task in the database
        await db.collection("tasks").updateOne(
            { _id: new ObjectId(id) }, // Match task by its ID
            { $set: updatedTask } // Update the fields with the new values
        );

        // Respond with the updated task
        res.status(200).json(updatedTask);
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Failed to update task" });
    }
};

// Delete a task by ID
const deleteTask = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params; // Extract the task ID from the URL parameters

    try {
        // Find the task by ID
        const task = await db.collection("tasks").findOne({ _id: new ObjectId(id) });

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Delete the task from the database
        await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });

        // Respond with a success message
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Failed to delete task" });
    }
};

module.exports = {
    getAllTasks,
    getSingleTask,
    createTask,
    updateTask,
    deleteTask,
};
