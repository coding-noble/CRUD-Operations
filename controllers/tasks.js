const { ObjectId } = require("mongodb");
const { getDatabase } = require("../data/database");
const { check, validationResult } = require('express-validator');

const handleDatabaseAction = async (action, res) => {
  try {
    return await action();
  } catch (err) {
    res.status(500).json({ error: err.message || "Tasks collection error" });
  }
};

const getAllTasks = async (req, res) => {
  //#swagger.tags = ['Tasks']
  //#swagger.summary = 'Get all the tasks'
  const db = getDatabase();
  handleDatabaseAction(() => db.collection("tasks").find().toArray().then(tasks => res.status(200).json(tasks)), res);
};

const getSingleTask = async (req, res) => {
  //#swagger.tags = ['Tasks']
  //#swagger.summary = 'Get a single task by ID'
  const { id } = req.params;
  const db = getDatabase();
  handleDatabaseAction(() =>
    db.collection("tasks").findOne({ _id: new ObjectId(id) })
      .then(task => task ? res.status(200).json(task) : res.status(404).json({ error: "Task not found" })),
    res
  );
};

const createTask = async (req, res) => {
  //#swagger.tags = ['Tasks']
  //#swagger.summary = 'Create a new task'

  // Validation using express-validator
  await check('title').notEmpty().withMessage('Title is required').run(req);
  await check('description').notEmpty().withMessage('Description is required').run(req);
  await check('createdAt').optional().isISO8601().withMessage('CreatedAt must be a valid ISO 8601 date').run(req);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, createdAt } = req.body;
  if (!title || !description) return res.status(400).json({ error: "Title and description are required" });

  const db = getDatabase();
  const newTask = { title, description, completed: false, createdAt: createdAt ? new Date(createdAt) : new Date() };

  handleDatabaseAction(() =>
    db.collection("tasks").insertOne(newTask)
      .then(result => result.insertedId ? res.status(201).json({ ...newTask, _id: result.insertedId }) : res.status(500).json({ error: "Failed to insert task" })),
    res
  );
};

const updateTask = async (req, res) => {
  //#swagger.tags = ['Tasks']
  //#swagger.summary = 'Edit/Update a task by ID'

  // Validate the incoming data
  await check('title').optional().notEmpty().withMessage('Title must not be empty').run(req);
  await check('description').optional().notEmpty().withMessage('Description must not be empty').run(req);
  await check('completed').optional().isBoolean().withMessage('Completed must be a boolean').run(req);

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, completed } = req.body;
  const db = getDatabase();

  handleDatabaseAction(() =>
    db.collection("tasks").findOne({ _id: new ObjectId(id) })
      .then(task => {
        if (!task) return res.status(404).json({ error: "Task not found" });
        const updatedTask = { ...task, title: title || task.title, description: description || task.description, completed: completed !== undefined ? completed : task.completed };
        return db.collection("tasks").updateOne({ _id: new ObjectId(id) }, { $set: updatedTask })
          .then(() => res.status(200).json(updatedTask));
      }),
    res
  );
};

const deleteTask = async (req, res) => {
  //#swagger.tags = ['Tasks']
  //#swagger.summary = 'Delete a task by ID'

  // Validate that the ID is a valid ObjectId
  await check('id').isMongoId().withMessage('Invalid task ID').run(req);

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const db = getDatabase();

  handleDatabaseAction(() =>
    db.collection("tasks").findOne({ _id: new ObjectId(id) })
      .then(task => {
        if (!task)
          return res.status(404).json({ error: "Task not found" });
        return db.collection("tasks").deleteOne({ _id: new ObjectId(id) })
          .then(() => res.status(200).json({ message: "Task deleted successfully" }))
      }),
    res
  );
};

module.exports = { getAllTasks, getSingleTask, createTask, updateTask, deleteTask };
