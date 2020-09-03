const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
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
        User.findById(email, function (err, user) {
          if (err) {
            return done(err);
          }

          if (!user) {
            return done(null, false, { msg: "Incorrect email" });
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
                    return done(null, false, { msg: "Incorrect password" });
                  }
                })
                .catch((err) => {
                  return done(err);
                });
            }
          }
        });
      }
    )
  );

  // Configure the Google strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        proxy: true,
      },
      function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        User.findById(profile.emails[0].value, function (err, user) {
          if (err) {
            return done(err);
          }

          if (user) {
            if (
              typeof user.externalAuth === "undefined" ||
              user.externalAuth.provider != "google" ||
              user.externalAuth.id != profile.id
            ) {
              return done(null, false, { msg: "Login error" });
            } else {
              return done(null, user);
            }
          } else {
            const newUser = {
              _id: profile.emails[0].value,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              internalAuth: undefined,
              externalAuth: { provider: "google", id: profile.id },
              picture: profile.photos[0].value,
            };

            let user = new User(newUser);
            user
              .save()
              .then((user) => {
                return done(null, user);
              })
              .catch((err) => {
                return done(err);
              });
          }
        });
      }
    )
  );

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
