const { ObjectId } = require("mongodb");
const { getDatabase } = require("../data/database");
const { check, validationResult } = require('express-validator');

const handleDatabaseAction = async (action, res) => {
    try {
        return await action();
    } catch (err) {
        res.status(500).json({ error: err.message || "Users collection error" });
    }
};

const getAllUsers = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Get all the users'
    const db = getDatabase();
    handleDatabaseAction(() => db.collection("users").find().toArray().then(users => res.status(200).json(users)), res);
};

const getSingleUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Get a single user by ID'
    const { id } = req.params;
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection("tasks").findOne({ _id: new ObjectId(id) })
            .then(user => user ? res.status(200).json(user) : res.status(404).json({ error: "User not found" })),
        res
    );
};

const createUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Create a new user'

    // Validation using express-validator
    await check('username').notEmpty().withMessage('Username is required').run(req);
    await check('email').isEmail().withMessage('Invalid email format').run(req);
    await check('password').notEmpty().withMessage('Password is required').run(req);
    await check('first_name').notEmpty().withMessage('First name is required').run(req);
    await check('last_name').notEmpty().withMessage('Last name is required').run(req);

    await check('address')
        .optional()
        .isObject().withMessage('Address must be an object')
        .custom((value) => {
            if (value) {
                const { street, city, state, zip } = value;
                if (!street || typeof street !== 'string') {
                    throw new Error('Street is required and must be a string');
                }
                if (!city || typeof city !== 'string') {
                    throw new Error('City is required and must be a string');
                }
                if (!state || typeof state !== 'string') {
                    throw new Error('State is required and must be a string');
                }
                if (!zip || typeof zip !== 'string') {
                    throw new Error('ZIP code is required and must be a string');
                }

                const zipPattern = /^\d{5}(-\d{4})?$/;
                if (!zipPattern.test(zip)) {
                    throw new Error('ZIP code must be in the format XXXXX or XXXXX-XXXX');
                }
            }
            return true;
        })
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, first_name, last_name, address } = req.body;

    if (!username || !email || !password || !first_name || !last_name) {
        return res.status(400).json({ error: "Username, email, password, first name, and last name are required" });
    }

    const newUser = {
        username,
        email,
        password,
        first_name,
        last_name,
        address: address || {},
        roles: ['user'],
        created_at: new Date(),
        updated_at: new Date()
    };

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection("users").insertOne(newUser)
            .then(result => result.insertedId
                ? res.status(201).json({ ...newUser, _id: result.insertedId })
                : res.status(500).json({ error: "Failed to insert user" })
            ),
        res
    );
};

const updateUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Edit/Update a user by ID'

    // Validate the incoming data (all fields are optional for updating)
    await check('username').optional().notEmpty().withMessage('Username must not be empty').run(req);
    await check('email').optional().isEmail().withMessage('Invalid email format').run(req);
    await check('password').optional().notEmpty().withMessage('Password must not be empty').run(req);
    await check('first_name').optional().notEmpty().withMessage('First name must not be empty').run(req);
    await check('last_name').optional().notEmpty().withMessage('Last name must not be empty').run(req);

    await check('address')
        .optional()
        .isObject().withMessage('Address must be an object')
        .custom((value) => {
            if (value) {
                const { street, city, state, zip } = value;
                if (street && typeof street !== 'string') {
                    throw new Error('Street must be a string');
                }
                if (city && typeof city !== 'string') {
                    throw new Error('City must be a string');
                }
                if (state && typeof state !== 'string') {
                    throw new Error('State must be a string');
                }
                if (zip && typeof zip !== 'string') {
                    throw new Error('ZIP code must be a string');
                }

                const zipPattern = /^\d{5}(-\d{4})?$/;
                if (zip && !zipPattern.test(zip)) {
                    throw new Error('ZIP code must be in the format XXXXX or XXXXX-XXXX');
                }
            }
            return true;
        })
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username, email, password, first_name, last_name, address } = req.body;

    const db = getDatabase();

    handleDatabaseAction(() =>
        db.collection("users").findOne({ _id: new ObjectId(id) })
            .then(user => {
                if (!user) return res.status(404).json({ error: "User not found" });
                const updatedUser = {
                    ...user,
                    username: username || user.username,
                    email: email || user.email,
                    password: password || user.password,
                    first_name: first_name || user.first_name,
                    last_name: last_name || user.last_name,
                    address: address !== undefined ? address : user.address,
                };

                return db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: updatedUser })
                    .then(() => res.status(200).json(updatedUser));
            }),
        res
    );
};

const deleteUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Delete a user by ID'

    // Validate that the ID is a valid MongoDB ObjectId
    await check('id').isMongoId().withMessage('Invalid user ID').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const db = getDatabase();

    handleDatabaseAction(() =>
        db.collection("users").findOne({ _id: new ObjectId(id) })
            .then(user => {
                if (!user)
                    return res.status(404).json({ error: "User not found" });
                return db.collection("users").deleteOne({ _id: new ObjectId(id) })
                    .then(() => res.status(200).json({ message: "User deleted successfully" }))
            }),
        res
    );
};

module.exports = {
    getAllUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser,
}