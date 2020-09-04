const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const router = express.Router();

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
router.post("/register", (req, res) => {
  console.log(req.body);
  User.findById(req.body.email).then((user) => {
    if (user) {
      res.status(400).json({ error: "Email already exists" });
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
            _id: req.body.email,
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
            error:
              "There was an issue registering the account. Please try again later.",
          });
        });
    }
  });
});

module.exports = router;
