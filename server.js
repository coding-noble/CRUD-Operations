const bodyParser = require("body-parser");
const express = require("express");
const mongodb = require("./data/database.js");
const routes = require("./routes");

const app = express();
const port = process.env.PORT || 26000;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Z-Key");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use("/", routes);

const startServer = async () => {
  try {
    await mongodb.initDb("Task-Manager");
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
};

startServer();