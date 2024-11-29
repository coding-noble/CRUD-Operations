const express = require("express");
const taskRoutes = require("./taskRoutes");
const userRoutes = require("./userRoutes");
const swaggerRoutes = require("./swaggerRoutes");
const passport = require("passport");


const router = express.Router();

// Register routes
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);
router.use("/", swaggerRoutes);

//login and logout routes
router.use("/login", passport.authenticate("github"), (req, res) => { });

router.get("/logout", (req, res, next) => {
    //#swagger.tags = ['Authentication Logging System']
    //#swagger.summary = 'Logout of GitHub'
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;
