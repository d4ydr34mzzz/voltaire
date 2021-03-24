const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const passport = require("passport");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  ensureAuthenticated,
  safelyReturnCurrentUsersDocument,
} = require("../../helpers/auth.js");
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
 * @route GET /api/users/current
 * @access public
 * @description Get request route handler for the /api/users/current path (i.e. return the document corresponding to the current user)
 */
router.get("/current", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: req.user.id })
    .then((user) => {
      // *** Important reference: https://stackoverflow.com/questions/59690923/handlebars-access-has-been-denied-to-resolve-the-property-from-because-it-is *** //
      const newUserObject = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        internalAuth: { _id: user.internalAuth._id },
        picture: user.picture,
        profilePicturePublicId: user.profilePicturePublicId,
        profilePicture: user.profilePicture,
        profilePictureCroppingRectangle: user.profilePictureCroppingRectangle,
        coverImagePublicId: user.coverImagePublicId,
        coverImage: user.coverImage,
        coverImageCroppingRectangle: user.coverImageCroppingRectangle,
        fullName: user.firstName + " " + user.lastName,
        joined: user.joined,
      };

      res.json(newUserObject);
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
});

/**
 * @route POST /api/users/register
 * @access public
 * @description Post request route handler for the /api/users/register path
 */
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Email is invalid")
      .bail()
      .trim()
      .toLowerCase()
      .normalizeEmail(),
    body("firstName")
      .not()
      .isEmpty()
      .withMessage("First name is required")
      .bail()
      .trim()
      .isLength({ max: 100 })
      .withMessage("First name needs to be between 1 and 100 characters long")
      .bail()
      .isAlphanumeric()
      .withMessage("First name can only contain letters and numbers"),
    body("lastName")
      .not()
      .isEmpty()
      .withMessage("Last name is required")
      .bail()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Last name needs to be between 1 and 100 characters long")
      .bail()
      .isAlphanumeric()
      .withMessage("Last name can only contain letters and numbers"),
    body("password")
      .isLength({ max: 100 })
      .withMessage("Password cannot be more than 100 characters long")
      .bail()
      .isStrongPassword()
      .withMessage(
        "Password must be at least 8 characters long with at least one uppercase letter, one lowercase letter, one number, and one symbol"
      ),
    body("confirmPassword")
      .isLength({ min: 8, max: 100 })
      .withMessage("Password needs to be confirmed")
      .bail()
      .custom((value, { req }) => {
        return value === req.body.password;
      })
      .withMessage("Passwords must match"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    User.findOne({ email: req.body.email })
      .collation({ locale: "en", strength: 2 })
      .then((user) => {
        if (user) {
          res.status(403).json({ email: { msg: "Email already exists" } });
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
                res.locals.user = user;
                next();
              } else {
                throw new Error();
              }
            })
            .catch((err) => {
              res.status(500).json({
                error: {
                  msg:
                    "There was an issue processing the request. Please try again later.",
                },
              });
            });
        }
      });
  },
  safelyReturnCurrentUsersDocument
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
