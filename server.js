// import the Express path, and bodyParser modules
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");

// Create an Express app instance
const app = express();

// Create the port default is 26000 if not provided in environment variables (env)
const port = process.env.PORT || 26000;

// Create universal paths
const mongodb = require(path.join(__dirname, "data", "database.js"));
const routes = require(path.join(__dirname, "routes")); // Import all routes from index.js

// Use body-parser middleware for getting the parts of the user in the request
app.use(bodyParser.json());

// CORS headers (for cross-origin requests)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Z-Key"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Use routes middleware for handling routes
app.use("/", routes); // This will now use the combined routes from index.js

// Start the server and initialize the database (Task-Manager database)
const startServer = async () => {
  let dbName = "Task-Manager"
  // Initialize the database connection
  await mongodb.initDb(dbName).then(() => {
    // Start the server after establishing a database connection
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }).catch((err) => {
    console.error('Error initializing database:', err);
    process.exit(1); // Exit the process if there are any errors
  });
};

// Run the startServer async function
startServer();