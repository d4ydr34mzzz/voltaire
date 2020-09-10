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
const port = process.env.PORT || 3001;
require("dotenv").config();

// Get the appropriate MongoDB URI (development, testing, or production)
const { mongoURI } = require("./config/database.js");

/**
 * From https://mongoosejs.com/docs/deprecations.html#findandmodify: "Make Mongoose use `findOneAndUpdate()`. Note
 * that this option is `true` by default, you need to set it to false."
 */
mongoose.set("useFindAndModify", false);

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

// Mount the router module for auth on the /api/auth path in the main app
app.use("/api/auth", apiAuthRouter);

// Mount the router module for posts on the /api/posts path in the main app
app.use("/api/posts", apiPostsRouter);

// Mount the router module for profile on the /api/profile path in the main app
app.use("/api/profile", apiProfileRouter);

// Mount the router module for users on the /api/users path in the main app
app.use("/api/users", apiUsersRouter);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
