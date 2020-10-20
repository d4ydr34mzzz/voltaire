const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const passport = require("passport");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { ensureAuthenticated } = require("../../helpers/auth.js");
const saltRounds = 10;

// Run the code in User.js (no exports)
require("../../models/User.js");

// Run the code in Profile.js (no exports)
require("../../models/Profile.js");

// Retrieve the User model defined in User.js
const User = mongoose.model("User");

// Retrieve the Profile model defined in Profile.js
const Profile = mongoose.model("Profile");

/**
 * @route GET /api/users/test
 * @access public
 * @description Get request route handler for the /api/users/test path (i.e. check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "users" });
});

/**
 * @route POST /api/users/register
 * @access public
 * @description Post request route handler for the /api/users/register path
 */
router.post(
  "/register",
  [
    // TODO: Better server-side validation for the form fields being saved to the database
    body("email").isEmail().withMessage("Email is invalid"),
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        return value === req.body.password;
      })
      .withMessage("Passwords must match"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    console.log(req.body);
    User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        res.status(403).json({ errors: [{ msg: "Email already exists" }] });
      } else {
        bcrypt
          .genSalt(saltRounds)
          .then((salt) => {
            return bcrypt.hash(req.body.password, salt);
          })
          .then((hash) => {
            const picture = gravatar.url(req.body.email, {
              s: 200,
              r: "pg",
              d: "mp",
            });

            const newUser = {
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              internalAuth: { password: hash },
              externalAuth: undefined,
              picture: picture,
            };

            let user = new User(newUser);
            return user.save();
          })
          .then((user) => {
            if (user) {
              res.json(user);
            } else {
              throw new Error();
            }
          })
          .catch((err) => {
            res.status(500).json({
              errors: [
                {
                  msg:
                    "There was an issue registering the account. Please try again later.",
                },
              ],
            });
          });
      }
    });
  }
);

/**
 * @route POST /api/users/login
 * @access public
 * @description Post request route handler for the /api/users/login path
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is invalid"),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }
    next();
  },
  // Reference: http://www.passportjs.org/docs/authenticate/#custom-callback
  function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401);
        return next(info);
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        next();
      });
    })(req, res, next);
  },
  function (req, res) {
    // *** Important reference: https://stackoverflow.com/questions/59690923/handlebars-access-has-been-denied-to-resolve-the-property-from-because-it-is *** //
    const newUserObject = {
      _id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      internalAuth: { _id: req.user.internalAuth._id },
      picture: req.user.picture,
      fullName: req.user.firstName + " " + req.user.lastName,
      joined: req.user.joined,
    };

    res.json(newUserObject);
  }
);

/**
 * @route DELETE /api/users/:user_id
 * @access private
 * @description Delete request route handler for the /api/users/:user_id path (delete a user from DevConnector)
 */
router.delete("/:user_id", ensureAuthenticated, (req, res) => {
  if (req.user.id !== req.params.user_id) {
    return res.status(403).json({
      errors: [
        {
          msg: "Forbidden request",
        },
      ],
    });
  } else {
    Profile.findOneAndRemove({ user: req.user.id })
      .then((profile) => {
        User.findOneAndRemove({ _id: req.user.id })
          .then((user) => {
            req.logOut();
            res.json(user);
          })
          .catch((err) => {
            res.status(500).json({
              errors: [
                {
                  msg:
                    "There was an issue processing the request. Please try again later.",
                },
              ],
            });
          });
      })
      .catch((err) => {
        res.status(500).json({
          errors: [
            {
              msg:
                "There was an issue processing the request. Please try again later.",
            },
          ],
        });
      });
  }
});

module.exports = router;
