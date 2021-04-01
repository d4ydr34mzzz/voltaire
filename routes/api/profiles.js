const express = require("express");
const mongoose = require("mongoose");
const {
  getPaginatedResponseFromMongoDBWithSortAndPopulation,
} = require("../../middleware/pagination.js");
const { ensureAuthenticated } = require("../../helpers/auth.js");
const { param, validationResult } = require("express-validator");
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
 * @route GET /api/profiles/test
 * @access public
 * @description Get request route handler for the /api/profiles/test path (check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "profiles" });
});

/**
 * @route GET /api/profiles/:page-:limit
 * @access private
 * @description Get request route handler for the /api/profiles/:page-:limit path (returns a page with the given limit from the list of all profiles on the site)
 */
router.get(
  "/:page-:limit",
  ensureAuthenticated,
  [
    param("page")
      .not()
      .isEmpty()
      .withMessage("The page number is required")
      .bail()
      .isInt({ min: 1, allow_leading_zeroes: false })
      .withMessage("The page number cannot be less than 1")
      .bail()
      .toInt(),
    param("limit")
      .not()
      .isEmpty()
      .withMessage("The limit is required")
      .bail()
      .isInt({ min: 1, max: 30, allow_leading_zeroes: false })
      .withMessage("The limit needs to be between 1 and 30, inclusive")
      .bail()
      .toInt(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    } else {
      next();
    }
  },
  getPaginatedResponseFromMongoDBWithSortAndPopulation(
    Profile,
    { firstName: "asc", lastName: "asc" },
    {
      path: "user",
      select: ["firstName", "lastName", "picture"],
    }
  ),
  (req, res) => {
    res.json(res.paginatedResponse);
  }
);

module.exports = router;
