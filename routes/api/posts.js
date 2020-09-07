const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const { ensureAuthenticated } = require("../../helpers/auth");
const router = express.Router();

// Run the code in Post.js (no exports)
require("../../models/Post.js");

// Retrieve the Post model
const Post = mongoose.model("Post");

/**
 * @route GET /api/posts/test
 * @access public
 * @description Get request route handler for the /api/posts/test path (i.e. check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "posts API endpoint works" });
});

/**
 * @route POST /api/posts
 * @access private
 * @description Post request route handler for the /api/posts path (create a post under the current user)
 */
router.post(
  "/",
  ensureAuthenticated,
  [
    body("text")
      .not()
      .isEmpty()
      .withMessage("Post content is required")
      .isLength({ min: 10, max: 1500 })
      .withMessage("Post content must be between 10 and 1500 characters"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newPost = {
      user: req.user.id,
      text: req.body.text,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      avatar: req.body.avatar,
    };

    new Post(newPost)
      .save()
      .then((post) => {
        res.json(post);
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
);

module.exports = router;
