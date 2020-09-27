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
 * @description Get request route handler for the /api/profile/test path (check if the API endpoint is working)
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
          profile: {
            msg: "Profile does not exist yet",
          },
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
    body("status")
      .not()
      .isEmpty()
      .withMessage("Status is required")
      .custom((value, {}) => {
        // Reference: https://stackoverflow.com/questions/24718349/how-do-i-make-array-indexof-case-insensitive#answer-24718680
        let validOptions = [
          "Developer",
          "Junior developer",
          "Senior developer",
          "Manager",
          "Student",
          "Instructor",
          "Intern",
          "Other",
        ];
        let providedOption = String(value).toLowerCase();
        return validOptions.some((option) => {
          return providedOption === option.toLowerCase();
        });
      })
      .withMessage("Status is required"),
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
      return res.status(400).json(errors.mapped());
    }

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
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
                  handle: {
                    msg: "The handle is taken. Please try another one.",
                  },
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
          if (profile.handle !== req.body.handle) {
            // Existing user wants to change their handle
            Profile.findOne({ handle: req.body.handle })
              .then((profile) => {
                if (profile && profile.user !== req.user.id) {
                  res.status(400).json({
                    handle: {
                      msg: "The handle is taken. Please try another one.",
                    },
                  });
                } else {
                  newProfile.handle = req.body.handle;

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

/**
 * @route POST /api/profile/experience
 * @access private
 * @description Post request route handler for the /api/profile/experience path (add an experience entry to the current user's profile)
 */
router.post(
  "/experience",
  ensureAuthenticated,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("company").not().isEmpty().withMessage("Company is required"),
    body("from")
      .not()
      .isEmpty()
      .withMessage("A from date is required")
      .bail()
      .isISO8601()
      .withMessage("Invalid date format")
      .bail()
      .toDate(),
    body("to")
      .if((value, { req }) => {
        return req.body.to;
      })
      .isISO8601()
      .withMessage("Invalid date format")
      .bail()
      .toDate(),
    body("current")
      .isBoolean()
      .bail()
      .toBoolean()
      .if((value, { req }) => {
        return !req.body.current;
      })
      .custom((value, { req }) => {
        return req.body.to;
      })
      .withMessage(
        "A to date is required if you aren't currently working here"
      ),
    body("current")
      .isBoolean()
      .bail()
      .toBoolean()
      .custom((value, { req }) => {
        return !(req.body.current && req.body.to);
      })
      .withMessage(
        "A to date and currently attending cannot be set simultaneously"
      ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    Profile.findOne({ user: req.user.id })
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
          const newExperience = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description,
          };

          profile.experience.unshift(newExperience);
          profile
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
  }
);

/**
 * @route POST /api/profile/education
 * @access private
 * @description Post request route handler for the /api/profile/education path (add an education entry to the current user's profile)
 */
router.post(
  "/education",
  ensureAuthenticated,
  [
    body("school").not().isEmpty().withMessage("School is required"),
    body("degree").not().isEmpty().withMessage("Degree is required"),
    body("fieldOfStudy")
      .not()
      .isEmpty()
      .withMessage("Field of study is required"),
    body("from")
      .not()
      .isEmpty()
      .withMessage("A from date is required")
      .bail()
      .isISO8601()
      .withMessage("Invalid date format")
      .bail()
      .toDate(),
    body("to")
      .if((value, { req }) => {
        return req.body.to;
      })
      .isISO8601()
      .withMessage("Invalid date format")
      .bail()
      .toDate(),
    body("current")
      .isBoolean()
      .bail()
      .toBoolean()
      .if((value, { req }) => {
        return !req.body.current;
      })
      .custom((value, { req }) => {
        return req.body.to;
      })
      .withMessage(
        "A to date is required if you aren't currently studying here"
      ),
    body("current")
      .isBoolean()
      .bail()
      .toBoolean()
      .custom((value, { req }) => {
        return !(req.body.current && req.body.to);
      })
      .withMessage(
        "A to date and currently attending cannot be set simultaneously"
      ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    Profile.findOne({ user: req.user.id })
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
          const newEducation = {
            school: req.body.school,
            degree: req.body.degree,
            fieldOfStudy: req.body.fieldOfStudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description,
            activities: req.body.activities,
          };

          profile.education.unshift(newEducation);
          profile
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
  }
);

/**
 * @route PUT /api/profile/about
 * @access private
 * @description Put request route handler for the /api/profile/about path (add or update the about me section in the current user's profile)
 */
router.put("/about", ensureAuthenticated, (req, res) => {
  Profile.findOne({ user: req.user.id })
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
        const updatedProfile = {
          bio: "",
        };

        if (req.body.bio) {
          updatedProfile.bio = req.body.bio;
        }

        Profile.findOneAndUpdate({ user: req.user.id }, updatedProfile, {
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

// TODO: Add routes to edit education and experience entries?

/**
 * @route DELETE /api/profile/education/:education_id
 * @access private
 * @description Delete request route handler for the /api/profile/education/:education_id path (delete an education entry from the current user's profile)
 */
router.delete("/education/:education_id", ensureAuthenticated, (req, res) => {
  Profile.findOne({ user: req.user.id })
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
        const educationIndex = profile.education
          .map((experience) => {
            return experience.id;
          })
          .indexOf(req.params.education_id);

        profile.education.splice(educationIndex, 1);
        profile
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
});

/**
 * @route DELETE /api/profile/experience/:experience_id
 * @access private
 * @description Delete request route handler for the /api/profile/experience/:experience_id path (delete an experience entry from the current user's profile)
 */
router.delete("/experience/:experience_id", ensureAuthenticated, (req, res) => {
  Profile.findOne({ user: req.user.id })
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
        const experienceIndex = profile.experience
          .map((experience) => {
            return experience.id;
          })
          .indexOf(req.params.experience_id);

        profile.experience.splice(experienceIndex, 1);
        profile
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
});

module.exports = router;
