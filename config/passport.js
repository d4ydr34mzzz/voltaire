const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = mongoose.model("User");

module.export = function (passport) {
  // Configure the local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      function (username, password, done) {
        User.findById(username, function (err, user) {
          if (err) {
            return done(err);
          }

          if (!user) {
            return done(null, false, { msg: "Incorrect username" });
          } else {
            bcrypt
              .compare(password, user.internalAuth.password)
              .then((res) => {
                if (res) {
                  return done(null, user);
                } else {
                  return done(null, false, { msg: "Incorrect password" });
                }
              })
              .catch((err) => {
                return done(err);
              });
          }
        });
      }
    )
  );

  // TODO: Configure a Google strategy

  // Serialize a user instance to the session
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  // Deserialize a user instance from the session
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
