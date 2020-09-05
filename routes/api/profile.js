const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const { ensureAuthenticated } = require("../../helpers/auth");
const router = express.Router();

// Run the code in User.js (no exports)
require("../../models/User.js");

// Run the code in Profile.js (no exports)
require("../../models/Profile.js");

// Retrieve the User model defined in User.js
const User = mongoose.model("User");

// Retrieve the Profile model defined in Profile.js
const Profile = mongoose.model("Profile");

/**
 * @route GET /api/profile/test
 * @access public
 * @description Get request route handler for the /api/profile/test path (i.e. check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "profile API endpoint works" });
});

/**
 * @route GET /api/profile
 * @access private
 * @description Get request route handler for the /api/profile path (return the current user's profile)
 */
router.get("/", ensureAuthenticated, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      if (!profile) {
        return res.status(404).json({
          errors: [
            {
              msg: "Profile does not exist yet",
            },
          ],
        });
      }

      res.json(profile);
    })
    .catch((err) => {
      console.log(err);
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

module.exports = router;
