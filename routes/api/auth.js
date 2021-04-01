const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { safelyReturnCurrentUsersDocument } = require("../../helpers/auth.js");
const { passportLoginMethod } = require("../../promises/passport.js");
const { body, validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Run the code in User.js (no exports)
require("../../models/User.js");

// Retrieve the User model defined in User.js
const User = mongoose.model("User");

/**
 * @route GET /api/auth/test
 * @access public
 * @description Get request route handler for the /api/auth/test path (check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "auth" });
});

/**
 * @route POST /api/auth/google/tokensignin
 * @access public
 * @description Route path for Google OAuth 2.0 using verifiable ID tokens
 */
router.post(
  "/google/tokensignin",
  [body("token").not().isEmpty().withMessage("ID token is required")],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    /*
     * References:
     * https://developers.google.com/identity/sign-in/web/backend-auth
     * https://www.youtube.com/watch?v=j_31hJtWjlw
     */
    client
      .verifyIdToken({
        idToken: req.body.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      .then((ticket) => {
        const payload = ticket.getPayload();
        const usersUniqueGoogleID = payload.sub;

        return User.findOne({ email: payload.email })
          .collation({ locale: "en", strength: 2 })
          .then((user) => {
            if (user) {
              if (
                typeof user.externalAuth === "undefined" ||
                user.externalAuth.provider != "google" ||
                user.externalAuth.id != usersUniqueGoogleID
              ) {
                res.status(405).json({
                  error: {
                    msg: `An account with the email ${payload.email} already exists. Please sign in using your email and password.`,
                  },
                });
              } else {
                res.locals.user = user;
                return passportLoginMethod(req, user);
              }
            } else {
              // It's possible for a Google user to change the email address associated with
              // their account; we want to check if there's a user document with the current
              // user's unique Google ID. If there isn't, we can go ahead and create an account.
              return User.findOne({
                "externalAuth.provider": "google",
                "externalAuth.sub": usersUniqueGoogleID,
              }).then((user) => {
                if (user) {
                  res.locals.user = user;
                  return passportLoginMethod(req, user);
                } else {
                  const newUser = {
                    email: payload.email,
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    internalAuth: undefined,
                    externalAuth: {
                      provider: "google",
                      id: usersUniqueGoogleID,
                    },
                    picture: payload.picture,
                  };

                  let user = new User(newUser);
                  return user.save().then((user) => {
                    res.locals.user = user;
                    return passportLoginMethod(req, user);
                  });
                }
              });
            }
          });
      })
      .then(() => {
        next();
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  },
  safelyReturnCurrentUsersDocument
);

/**
 * @route GET /api/auth/logout
 * @access public
 * @description Get request route handler for the /api/users/logout path (terminate a login session)
 */
router.get("/logout", (req, res) => {
  req.logout();
  // Reference: https://github.com/jdesboeufs/connect-mongo/issues/140#issuecomment-68108810 (remove the session entry from the database)
  req.session = null;
  res.status(200).send();
});

module.exports = router;
