const express = require("express");
const router = express.Router();

const userController = require("../controllers/users");
const { isAuthenticated } = require("../middleware/authentication.js")

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.post("/", isAuthenticated, userController.createUser);
router.put("/:id", isAuthenticated, userController.updateUser);
router.delete("/:id", isAuthenticated, userController.deleteUser);

module.exports = router;