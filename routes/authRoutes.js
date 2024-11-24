const express = require("express");
const router = express.Router();

// Placeholder for registration route
router.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Save to the database (example, not secure)
  const db = require("../data/database").getDb();
  db.collection("users").insertOne({ username, password })
    .then(() => res.status(201).json({ message: "User registered successfully" }))
    .catch((err) => res.status(500).json({ error: "Failed to register user" }));
});

// Placeholder for login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Find the user and validate (example, not secure)
  const db = require("../data/database").getDb();
  db.collection("users").findOne({ username, password })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.status(200).json({ message: "User logged in successfully" });
    })
    .catch((err) => res.status(500).json({ error: "Login failed" }));
});

module.exports = router;
