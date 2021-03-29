const express = require("express");
const router = express.Router();

/**
 * @route GET /api/showcase
 * @access public
 * @description Get request route handler for the /api/showcase path (returns the URL for a random
 * showcase image to be displayed on the 'Log in' and 'Sign up' pages)
 */
router.get("/", (req, res) => {
  if (process.env.CLOUDINARY_SHOWCASE_IMAGES) {
    let showcaseImages = process.env.CLOUDINARY_SHOWCASE_IMAGES.split(" ");
    let showcaseImage =
      showcaseImages[Math.floor(Math.random() * showcaseImages.length)];
    res.json({ showcaseImage });
  } else {
    console.log("Showcase URLs are not defined in the environment");
  }
});

module.exports = router;
