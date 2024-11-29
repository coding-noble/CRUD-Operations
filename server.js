const bodyParser = require("body-parser");
const express = require("express");
const mongodb = require("./data/database.js");
const routes = require("./routes");

// add in require for authentication
const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;
const cors = require("cors");

const port = process.env.PORT || 2600;
const app = express();

//update app
app
  .use(bodyParser.json())
  .use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Z-Key");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
  })
  .use(cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"]
  }))
  .use(cors({ origin: "*" }))
  .use("/", routes);

// 
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},
  function (accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ githubID: profile.id }, function (err, user) {
    return done(null, profile);
    // });
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

//add endpoints for github

app.get('/', (req, res) => {
  res.send(req.session.user !== undefined ? `Logged in as ${req.session.user.displayName}` : "Logged Out")
});

app.get("/github/callback", passport.authenticate("github", {
  failureRedirect: "/api-docs", session: false
}),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
  });

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