const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const apiAuthRouter = require("./routes/api/auth.js");
const apiPostsRouter = require("./routes/api/posts.js");
const apiProfileRouter = require("./routes/api/profile.js");
const apiUsersRouter = require("./routes/api/users");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

// Get the appropriate MongoDB URI (development, testing, or production)
const { mongoURI } = require("./config/database.js");

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected ...");
  })
  .catch((error) => {
    console.log("There was an error connecting to MongoDB: " + error);
  });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Create a session middleware
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Configure the strategies
require("./config/passport.js")(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Foxglove");
});

app.use("/api/auth", apiAuthRouter);

app.use("/api/posts", apiPostsRouter);

app.use("/api/profile", apiProfileRouter);

app.use("/api/users", apiUsersRouter);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
