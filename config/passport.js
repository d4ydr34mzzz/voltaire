const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = mongoose.model("User");

module.exports = function (passport) {
  // Configure the local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      function (email, password, done) {
        User.findOne({ email: email }, function (err, user) {
          if (err) {
            return done(err);
          }

          if (!user) {
            return done(null, false, { email: { msg: "Incorrect email" } });
          } else {
            if (typeof user.internalAuth === "undefined") {
              return done(null, false, {
                msg: "Login error",
              });
            } else {
              bcrypt
                .compare(password, user.internalAuth.password)
                .then((res) => {
                  if (res) {
                    return done(null, user);
                  } else {
                    return done(null, false, {
                      password: { msg: "Incorrect password" },
                    });
                  }
                })
                .catch((err) => {
                  return done(err);
                });
            }
          }
        }).collation({ locale: "en", strength: 2 });
      }
    )
  );

  // Serialize a user instance to the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // Deserialize a user instance from the session
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
