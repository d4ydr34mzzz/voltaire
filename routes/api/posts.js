const express = require("express");
const router = express.Router();

/**
 * @route GET /api/posts/test
 * @access public
 * @description Get request route handler for the /api/posts/test path (i.e. check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "posts API endpoint works" });
});

module.exports = router;
