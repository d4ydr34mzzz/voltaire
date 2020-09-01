const express = require("express");
const router = express.Router();

/**
 * @route GET /api/users/test
 * @access public
 * @description Get request route handler for the /api/users/test path (i.e. check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "users API endpoint works" });
});

module.exports = router;
