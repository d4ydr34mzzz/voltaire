const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const passport = require("passport");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const saltRounds = 10;

// Run the code in User.js (no exports)
require("../../models/User.js");

// Retrieve the User model defined in User.js
const User = mongoose.model("User");

/**
 * @route GET /api/users/test
 * @access public
 * @description Get request route handler for the /api/users/test path (i.e. check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "users API endpoint works" });
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
      .custom((value, { req }) => {
        return value === req.body.password;
      })
      .withMessage("Passwords must match"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
      return res.status(400).json(errors);
    }
    next();
  },
  passport.authenticate("local", { successRedirect: "/" })
);

module.exports = router;
