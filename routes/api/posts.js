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
 * @description Get request route handler for the /api/posts/test path (check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "posts" });
});

/**
 * @route GET /api/posts
 * @access private
 * @description Get request route handler for the /api/posts path (retrieve all the posts)
 */
router.get("/", ensureAuthenticated, (req, res) => {
  Post.find()
    .then((posts) => {
      if (!posts) {
        res.status(404).json({
          errors: [
            {
              msg: "There are no posts",
            },
          ],
        });
      } else {
        res.json(posts);
      }
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
 * @route GET /api/posts/:post_id
 * @access private
 * @description Get request route handler for the /api/posts/:post_id path (retrieve a single post by it's post_id)
 */
router.get("/:post_id", ensureAuthenticated, (req, res) => {
  Post.findById(req.params.post_id)
    .then((post) => {
      if (!post) {
        res.status(404).json({
          errors: [
            {
              msg: "Post does not exist",
            },
          ],
        });
      } else {
        res.json(post);
      }
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
      return res.status(400).json(errors.mapped());
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

/**
 * @route POST /api/posts/like/:post_id
 * @access private
 * @description Post request route handler for the /api/posts/like/:post_id path (like the post with post_id as the current user)
 */
router.post("/like/:post_id", ensureAuthenticated, (req, res) => {
  Post.findById(req.params.post_id)
    .then((post) => {
      if (
        post.likes.filter((like) => {
          return like.user.toString() === req.user.id;
        }).length > 0
      ) {
        res.status(403).json({
          errors: [
            {
              msg: "You have already liked this post",
            },
          ],
        });
      } else {
        const newLike = {
          user: req.user.id,
        };
        post.likes.unshift(newLike);
        post
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
 * @route POST /api/posts/unlike/:post_id
 * @access private
 * @description Post request route handler for the /api/posts/unlike/:post_id path (unlike the post with post_id as the current user)
 */
router.post("/unlike/:post_id", ensureAuthenticated, (req, res) => {
  Post.findById(req.params.post_id)
    .then((post) => {
      if (
        post.likes.filter((like) => {
          return like.user.toString() === req.user.id;
        }).length === 0
      ) {
        res.status(403).json({
          errors: [
            {
              msg: "You have not liked this post",
            },
          ],
        });
      } else {
        const likeIndex = post.likes
          .map((like) => {
            return like.user.toString();
          })
          .indexOf(req.user.id);

        post.likes.splice(likeIndex, 1);
        post
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
 * @route POST /api/posts/:post_id/comment
 * @access private
 * @description Post request route handler for the /api/posts/:post_id/comment path (comment on the post with post_id as the current user)
 */
router.post(
  "/:post_id/comment",
  ensureAuthenticated,
  [
    body("text")
      .not()
      .isEmpty()
      .withMessage("Comment content is required")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Comments must be between 10 and 1000 characters"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    Post.findById(req.params.post_id)
      .then((post) => {
        if (!post) {
          res.status(404).json({
            errors: [
              {
                msg: "Post does not exist",
              },
            ],
          });
        } else {
          const newComment = {
            user: req.user.id,
            text: req.body.text,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            avatar: req.body.avatar,
          };

          post.comments.unshift(newComment);
          post
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

// TODO: Add a put request route handler for /api/posts/:post_id to allow the current user to edit one of their posts

// TODO: Add a put request route handler for /api/posts/:post_id/comments/:comment_id to allow the current user to edit their comments

/**
 * @route DELETE /api/posts/:post_id
 * @access private
 * @description Delete request route handler for the /api/posts/:post_id path (delete a single post belonging to the current user by it's post_id)
 */
router.delete("/:post_id", ensureAuthenticated, (req, res) => {
  Post.deleteOne({ _id: req.params.post_id, user: req.user.id })
    .then((post) => {
      if (post.deletedCount === 0) {
        res.status(404).json({
          errors: [
            {
              msg: "Post does not exist",
            },
          ],
        });
      } else {
        res.json({
          deletedCount: post.deletedCount,
        });
      }
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
 * @route DELETE /api/posts/:post_id/comments/:comment_id
 * @access private
 * @description Post request route handler for the /api/posts/:post_id/comments/:comment_id path (delete a comment with comment_id belonging to the current user from the post with post_id)
 */
router.delete(
  "/:post_id/comments/:comment_id",
  ensureAuthenticated,
  (req, res) => {
    Post.findById(req.params.post_id)
      .then((post) => {
        if (!post) {
          res.status(404).json({
            errors: [
              {
                msg: "Post does not exist",
              },
            ],
          });
        } else {
          if (
            post.comments.filter((comment) => {
              return (
                comment._id.toString() === req.params.comment_id &&
                comment.user.toString() === req.user.id
              );
            }).length === 0
          ) {
            res.status(404).json({
              errors: [
                {
                  msg: "Comment does not exist",
                },
              ],
            });
          } else {
            const commentIndex = post.comments
              .map((comment) => {
                return comment._id;
              })
              .indexOf(req.params.comment_id);

            post.comments.splice(commentIndex, 1);
            post
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
        }
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
