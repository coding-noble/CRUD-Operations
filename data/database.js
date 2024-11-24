const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

// MongoDB connection URI (from .env)
const url = process.env.MONGODB_URL;

console.log("Mongo URI:", url); // Confirm that the Mongo URI is loaded

let db; // MongoDB database instance

// Function to validate that environment variables are set
const validateEnvVars = () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL environment variable is not defined.");
  }
};

// Initialize the database connection
const initDb = async (dbName) => {
  validateEnvVars();

  try {
    console.log("Attempting to connect to MongoDB...");
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Connect to the MongoDB database
    await client.connect();
    db = client.db(dbName); // Select the database

    console.log(`Connected to MongoDB database: ${dbName}`);

    return db;
  } catch (err) {
    console.error("Error initializing database:", err.message);
    throw new Error("Database connection failed");
  }
};

// Export database initialization and connection object
module.exports = {
  initDb,
  getDatabase: () => db,
};
