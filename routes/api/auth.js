const express = require("express");
const passport = require("passport");
const router = express.Router();

require("../../models/User.js");

/**
 * @route GET /api/auth/test
 * @access public
 * @description Get request route handler for the /api/auth/test path (check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "auth" });
});

/**
 * @route GET /api/auth/google
 * @access public
 * @description Route path for Google OAuth 2.0
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @route GET /api/auth/google/callback
 * @access public
 * @description Route path Google will redirect the user to after authorization
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { successRedirect: "/" })
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
