const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const { ensureAuthenticated } = require("../../helpers/auth");
const { body, validationResult } = require("express-validator");
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
    .populate("user", ["firstName", "lastName", "picture"])
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

/**
 * @route GET /api/profile/handle/:handle
 * @access private
 * @description Get request route handler for the /api/profile/handle/:handle path (return the user profile associated with the given handle)
 */
router.get("/handle/:handle", ensureAuthenticated, (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["firstName", "lastName", "picture"])
    .then((profile) => {
      if (!profile) {
        res.status(404).json({
          errors: [
            {
              msg: "Profile does not exist",
            },
          ],
        });
      } else {
        res.json(profile);
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
 * @route GET /api/profile/user/:user_id
 * @access private
 * @description Get request route handler for the /api/profile/user/:user_id path (return the user profile associated with the given user_id)
 */
router.get("/user/:user_id", ensureAuthenticated, (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["firstName", "lastName", "picture"])
    .then((profile) => {
      if (!profile) {
        res.status(404).json({
          errors: [
            {
              msg: "Profile does not exist",
            },
          ],
        });
      } else {
        res.json(profile);
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
 * @route GET /api/profile/all
 * @access private
 * @description Get request route handler for the /api/profile/handle/:handle path (return all the profiles)
 */
router.get("/all", ensureAuthenticated, (req, res) => {
  Profile.find()
    .populate("user", ["firstName", "lastName", "picture"])
    .then((profiles) => {
      if (!profiles) {
        res.status(404).json({
          errors: [
            {
              msg: "There are no profiles",
            },
          ],
        });
      } else {
        res.json(profiles);
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
 * @route POST /api/profile
 * @access private
 * @description Post request route handler for the /api/profile path (initialize or update the current user's profile)
 */
router.post(
  "/",
  ensureAuthenticated,
  [
    body("handle")
      .not()
      .isEmpty()
      .withMessage("Profile handle is required")
      .isLength({ min: 2, max: 40 })
      .withMessage("Profile handle needs to be between 2 and 40 characters"),
    body("website")
      .if((value, { req }) => {
        return req.body.website;
      })
      .isURL()
      .withMessage("Invalid URL"),
    body("status").not().isEmpty().withMessage("Status is required"),
    body("skills").not().isEmpty().withMessage("Skills field is required"),
    body("youtube")
      .if((value, { req }) => {
        return req.body.youtube;
      })
      .isURL()
      .withMessage("Invalid URL"),
    body("twitter")
      .if((value, { req }) => {
        return req.body.twitter;
      })
      .isURL()
      .withMessage("Invalid URL"),
    body("facebook")
      .if((value, { req }) => {
        return req.body.facebook;
      })
      .isURL()
      .withMessage("Invalid URL"),
    body("linkedin")
      .if((value, { req }) => {
        return req.body.linkedin;
      })
      .isURL()
      .withMessage("Invalid URL"),
    body("instagram")
      .if((value, { req }) => {
        return req.body.instagram;
      })
      .isURL()
      .withMessage("Invalid URL"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newProfile = {};
      if (req.body.company) {
        newProfile.company = req.body.company;
      }
      if (req.body.website) {
        newProfile.website = req.body.website;
      }
      if (req.body.location) {
        newProfile.location = req.body.location;
      }
      if (req.body.status) {
        newProfile.status = req.body.status;
      }
      if (req.body.skills) {
        newProfile.skills = req.body.skills.split(",");
      }
      if (req.body.bio) {
        newProfile.bio = req.body.bio;
      }
      if (req.body.githubUsername) {
        newProfile.githubUsername = req.body.githubUsername;
      }
      newProfile.social = {};
      if (req.body.youtube) {
        newProfile.social.youtube = req.body.youtube;
      }
      if (req.body.twitter) {
        newProfile.social.twitter = req.body.twitter;
      }
      if (req.body.facebook) {
        newProfile.social.facebook = req.body.facebook;
      }
      if (req.body.linkedin) {
        newProfile.social.linkedin = req.body.linkedin;
      }
      if (req.body.instagram) {
        newProfile.social.instagram = req.body.instagram;
      }

      if (!profile) {
        Profile.findOne({ handle: req.body.handle })
          .then((profile) => {
            if (profile) {
              res.status(400).json({
                errors: [
                  {
                    msg: "The handle is taken. Please try another one.",
                  },
                ],
              });
            } else {
              newProfile.user = req.user.id;
              newProfile.handle = req.body.handle;

              new Profile(newProfile)
                .save()
                .then((profile) => {
                  res.json(profile);
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
      } else {
        Profile.findOneAndUpdate({ user: req.user.id }, newProfile, {
          new: true,
        })
          .then((profile) => {
            res.json(profile);
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
    });
  }
);

module.exports = router;
