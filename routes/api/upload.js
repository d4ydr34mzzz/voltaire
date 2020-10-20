const express = require("express");
const mongoose = require("mongoose");
const { ensureAuthenticated } = require("../../helpers/auth.js");
const router = express.Router();

// Run the code in Profile.js (no exports)
require("../../models/Profile.js");

// Retrieve the Profile model defined in Profile.js
const Profile = mongoose.model("Profile");

/**
 * @route GET /api/upload/test
 * @access public
 * @description Get request route handler for the /api/upload/test path (check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "upload" });
});

/**
 * @route POST /api/upload
 * @access private
 * @description Post request route handler for the /api/upload path (upload a file associated with the current user)
 */
router.post("/", ensureAuthenticated, (req, res) => {});

module.exports = router;
