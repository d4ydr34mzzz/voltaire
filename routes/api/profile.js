const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const { ensureAuthenticated } = require("../../helpers/auth.js");
const { compareDates } = require("../../helpers/compare.js");
const {
  addHttpsProtocolToValidatedSocialURLWithoutProtocol,
  sanitizeQuillInput,
} = require("../../helpers/sanatize.js");
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
  res.json({ msg: "profile" });
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
 * @route POST /api/profile
 * @access private
 * @description Post request route handler for the /api/profile path (initialize the current user's profile)
 */
router.post(
  "/",
  ensureAuthenticated,
  [
    body("firstName")
      .not()
      .isEmpty()
      .withMessage("First name is required")
      .bail()
      .trim()
      .isLength({ max: 100 })
      .withMessage("First name needs to be between 1 and 100 characters long")
      .bail()
      .isAlphanumeric()
      .withMessage("First name can only contain letters and numbers"),
    body("lastName")
      .not()
      .isEmpty()
      .withMessage("Last name is required")
      .bail()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Last name needs to be between 1 and 100 characters long")
      .bail()
      .isAlphanumeric()
      .withMessage("Last name can only contain letters and numbers"),
    body("handle")
      .not()
      .isEmpty()
      .withMessage("Profile handle is required")
      .bail()
      .trim()
      .isLength({ min: 2, max: 40 })
      .withMessage(
        "Profile handle needs to be between 2 and 40 characters long"
      )
      .bail()
      .isAlphanumeric()
      .withMessage("Profile handle can only contain letters and numbers")
      .bail()
      .toLowerCase(),
    body("header")
      .not()
      .isEmpty()
      .withMessage("Profile header is required")
      .bail()
      .trim()
      .isLength({ max: 250 })
      .withMessage(
        "Profile header needs to be between 1 and 250 characters long"
      )
      .bail()
      .isAscii()
      .withMessage("Profile header can only contain ASCII characters"),
    body("status")
      .not()
      .isEmpty()
      .withMessage("Status is required")
      .bail()
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
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    Profile.findOne({ user: req.user.id })
      .then((profile1) => {
        if (!profile1) {
          return Profile.findOne({ handle: req.body.handle }).then(
            (profile2) => {
              if (profile2) {
                res.status(400).json({
                  handle: {
                    msg: "The handle is taken. Please try another one.",
                  },
                });
              } else {
                return User.findOne({ _id: req.user.id }).then((user) => {
                  let updateUser = false;

                  if (user.firstName !== req.body.firstName) {
                    user.firstName = req.body.firstName;
                    updateUser = true;
                  }
                  if (user.lastName !== req.body.lastName) {
                    user.lastName = req.body.lastName;
                    updateUser = true;
                  }

                  let newProfile = {
                    user: req.user.id,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    handle: req.body.handle,
                    header: req.body.header,
                    status: req.body.status,
                  };

                  return {
                    updateUser: updateUser,
                    user: user,
                    newProfile: newProfile,
                  };
                });
              }
            }
          );
        } else {
          throw new Error("A profile already exists for the current user");
        }
      })
      .then(({ updateUser, user, newProfile }) => {
        if (updateUser) {
          /*
           * References:
           * https://stackoverflow.com/a/62856639
           * https://jira.mongodb.org/browse/NODE-2014
           * https://mongoosejs.com/docs/transactions.html
           * https://mongodb.github.io/node-mongodb-native/3.2/api/ClientSession.html#withTransaction
           * https://docs.mongodb.com/manual/core/transactions-in-applications/
           * https://github.com/Automattic/mongoose/issues/8076
           */
          return mongoose.startSession().then((session) => {
            let updatedProfile = null;
            let fn = () => {
              return new Promise((resolve, reject) => {
                return new Profile(newProfile)
                  .save({ session: session })
                  .then((profile) => {
                    updatedProfile = profile;
                    return user.save();
                  })
                  .then((user) => {
                    resolve(user);
                  })
                  .catch((err) => {
                    reject(err);
                  });
              });
            };

            return session.withTransaction(fn).then(() => {
              return updatedProfile;
            });
          });
        } else {
          return new Profile(newProfile).save();
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
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
    body("title")
      .not()
      .isEmpty()
      .withMessage("Title is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage("Title needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Title can only contain ASCII characters")
      .bail()
      .trim(),
    body("company")
      .not()
      .isEmpty()
      .withMessage("Company is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage("Company needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Company can only contain ASCII characters")
      .bail()
      .trim(),
    body("location")
      .if((value, { req }) => {
        return req.body.location;
      })
      .isLength({ max: 150 })
      .withMessage("Location needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Location can only contain ASCII characters")
      .bail()
      .trim(),
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
    body("description")
      .if((value, { req }) => {
        return req.body.description;
      })
      .isLength({ max: 2500 })
      .withMessage("Description needs to be between 0 and 2500 characters long")
      .bail()
      .isAscii()
      .withMessage("Description can only contain ASCII characters")
      .bail()
      .trim()
      .customSanitizer((value, { req }) => {
        return sanitizeQuillInput(value);
      }),
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
            error: {
              msg: "Profile does not exist",
            },
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

          if (profile.experience.length >= 30) {
            res.status(400).json({
              error: {
                msg:
                  "No more than 30 experience entries can be added to your profile",
              },
            });
          } else {
            profile.experience.unshift(newExperience);
            profile.experience.sort(compareDates);
            return profile.save();
          }
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
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
    body("school")
      .not()
      .isEmpty()
      .withMessage("School is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage("School needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("School can only contain ASCII characters")
      .bail()
      .trim(),
    body("degree")
      .not()
      .isEmpty()
      .withMessage("Degree is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage("Degree needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Degree can only contain ASCII characters")
      .bail()
      .trim(),
    body("fieldOfStudy")
      .not()
      .isEmpty()
      .withMessage("Field of study is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage(
        "Field of study needs to be between 1 and 150 characters long"
      )
      .bail()
      .isAscii()
      .withMessage("Field of study can only contain ASCII characters")
      .bail()
      .trim(),
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
    body("description")
      .if((value, { req }) => {
        return req.body.description;
      })
      .isLength({ max: 2500 })
      .withMessage("Description needs to be between 0 and 2500 characters long")
      .bail()
      .isAscii()
      .withMessage("Description can only contain ASCII characters")
      .bail()
      .trim()
      .customSanitizer((value, { req }) => {
        return sanitizeQuillInput(value);
      }),
    body("activities")
      .if((value, { req }) => {
        return req.body.activities;
      })
      .isLength({ max: 2500 })
      .withMessage(
        "Clubs and activities needs to be between 0 and 2500 characters long"
      )
      .bail()
      .isAscii()
      .withMessage("Clubs and activities can only contain ASCII characters")
      .bail()
      .trim()
      .customSanitizer((value, { req }) => {
        return sanitizeQuillInput(value);
      }),
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
            error: {
              msg: "Profile does not exist",
            },
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

          if (profile.education.length >= 20) {
            res.status(400).json({
              error: {
                msg:
                  "No more than 20 education entries can be added to your profile",
              },
            });
          } else {
            profile.education.unshift(newEducation);
            profile.education.sort(compareDates);
            return profile.save();
          }
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

/**
 * @route PUT /api/profile/general
 * @access private
 * @description Put request route handler for the /api/profile/general path (update the general information section in the current user's profile)
 */
router.put(
  "/general",
  ensureAuthenticated,
  [
    body("firstName")
      .not()
      .isEmpty()
      .withMessage("First name is required")
      .bail()
      .trim()
      .isLength({ max: 100 })
      .withMessage("First name needs to be between 1 and 100 characters long")
      .bail()
      .isAlphanumeric()
      .withMessage("First name can only contain letters and numbers"),
    body("lastName")
      .not()
      .isEmpty()
      .withMessage("Last name is required")
      .bail()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Last name needs to be between 1 and 100 characters long")
      .bail()
      .isAlphanumeric()
      .withMessage("Last name can only contain letters and numbers"),
    body("handle")
      .not()
      .isEmpty()
      .withMessage("Profile handle is required")
      .bail()
      .trim()
      .isLength({ min: 2, max: 40 })
      .withMessage(
        "Profile handle needs to be between 2 and 40 characters long"
      )
      .bail()
      .isAlphanumeric()
      .withMessage("Profile handle can only contain letters and numbers")
      .bail()
      .toLowerCase(),
    body("header")
      .not()
      .isEmpty()
      .withMessage("Profile header is required")
      .bail()
      .trim()
      .isLength({ max: 250 })
      .withMessage(
        "Profile header needs to be between 1 and 250 characters long"
      )
      .bail()
      .isAscii()
      .withMessage("Profile header can only contain ASCII characters"),
    body("location")
      .if((value, { req }) => {
        return req.body.location;
      })
      .trim()
      .isLength({ max: 150 })
      .withMessage("Location needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Location can only contain ASCII characters"),
    body("status")
      .not()
      .isEmpty()
      .withMessage("Status is required")
      .bail()
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
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    Profile.findOne({ user: req.user.id })
      .then((profile1) => {
        if (!profile1) {
          res.status(404).json({
            error: {
              msg: "Profile does not exist",
            },
          });
        } else {
          if (profile1.handle !== req.body.handle) {
            return Profile.findOne({ handle: req.body.handle }).then(
              (profile2) => {
                if (profile2) {
                  res.status(400).json({
                    handle: {
                      msg: "The handle is taken. Please try another one.",
                    },
                  });
                } else {
                  let updateUser = false;

                  if (profile1.firstName !== req.body.firstName) {
                    profile1.firstName = req.body.firstName;
                    updateUser = true;
                  }
                  if (profile1.lastName !== req.body.lastName) {
                    profile1.lastName = req.body.lastName;
                    updateUser = true;
                  }

                  profile1.handle = req.body.handle;
                  if (profile1.header !== req.body.header) {
                    profile1.header = req.body.header;
                  }
                  if (profile1.location !== req.body.location) {
                    profile1.location = req.body.location;
                  }
                  if (profile1.status !== req.body.status) {
                    profile1.status = req.body.status;
                  }

                  return {
                    updateProfile: true,
                    updateUser: updateUser,
                    profile: profile1,
                  };
                }
              }
            );
          } else {
            let updateProfile = false;
            let updateUser = false;

            if (profile1.firstName !== req.body.firstName) {
              profile1.firstName = req.body.firstName;
              updateProfile = true;
              updateUser = true;
            }
            if (profile1.lastName !== req.body.lastName) {
              profile1.lastName = req.body.lastName;
              updateProfile = true;
              updateUser = true;
            }

            if (profile1.header !== req.body.header) {
              profile1.header = req.body.header;
              updateProfile = true;
            }
            if (profile1.location !== req.body.location) {
              profile1.location = req.body.location;
              updateProfile = true;
            }
            if (profile1.status !== req.body.status) {
              profile1.status = req.body.status;
              updateProfile = true;
            }

            return {
              updateProfile: updateProfile,
              updateUser: updateUser,
              profile: profile1,
            };
          }
        }
      })
      .then(({ updateProfile, updateUser, profile }) => {
        if (updateProfile && updateUser) {
          /*
           * References:
           * https://stackoverflow.com/a/62856639
           * https://jira.mongodb.org/browse/NODE-2014
           * https://mongoosejs.com/docs/transactions.html
           * https://mongodb.github.io/node-mongodb-native/3.2/api/ClientSession.html#withTransaction
           * https://docs.mongodb.com/manual/core/transactions-in-applications/
           */
          return mongoose.startSession().then((session) => {
            let updatedProfile = null;
            let fn = () => {
              return new Promise((resolve, reject) => {
                return User.findOne({ _id: req.user.id })
                  .session(session)
                  .exec()
                  .then((user) => {
                    if (user.firstName !== profile.firstName) {
                      user.firstName = profile.firstName;
                    }
                    if (user.lastName !== profile.lastName) {
                      user.lastName = profile.lastName;
                    }

                    let promise1 = profile.save({ session: session });
                    let promise2 = user.save();
                    return Promise.all([promise1, promise2]);
                  })
                  .then((values) => {
                    updatedProfile = values[0];
                    resolve(values[0]);
                  })
                  .catch((err) => {
                    reject(err);
                  });
              });
            };

            return session.withTransaction(fn).then(() => {
              return updatedProfile;
            });
          });
        } else if (updateProfile) {
          return profile.save();
        } else {
          return profile;
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

/**
 * @route PUT /api/profile/about
 * @access private
 * @description Put request route handler for the /api/profile/about path (add or update the about me section in the current user's profile)
 */
router.put(
  "/about",
  ensureAuthenticated,
  [
    body("bio")
      .if((value, { req }) => {
        return req.body.bio;
      })
      .isLength({ max: 3000 })
      .withMessage("About needs to be between 0 and 3000 characters long")
      .bail()
      .isAscii()
      .withMessage("About can only contain ASCII characters")
      .bail()
      .trim()
      .customSanitizer((value, { req }) => {
        return sanitizeQuillInput(value);
      }),
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
            error: {
              msg: "Profile does not exist",
            },
          });
        } else {
          profile.bio = req.body.bio ? req.body.bio : "";
          return profile.save();
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

/**
 * @route PUT /api/profile/skills
 * @access private
 * @description Put request route handler for the /api/profile/skills path (add or update the skills section in the current user's profile)
 */
router.put(
  "/skills",
  ensureAuthenticated,
  [
    body("skills")
      .isArray({ max: 100 })
      .withMessage("No more than 100 skills can be added to your profile")
      .bail()
      .custom((value, { req }) => {
        for (let element of req.body.skills) {
          if (
            typeof element !== "string" ||
            element.length === 0 ||
            element.length > 150
          ) {
            return false;
          }
        }
        return true;
      })
      .withMessage(
        "Individual skill entries need to be between 1 and 150 characters long"
      )
      .bail()
      .customSanitizer((value, { req }) => {
        let skills = value.map((skill) => String(skill).trim());
        return skills;
      }),
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
            error: {
              msg: "Profile does not exist",
            },
          });
        } else {
          profile.skills = req.body.skills ? req.body.skills : [];
          return profile.save();
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

/**
 * @route PUT /api/profile/interests
 * @access private
 * @description Put request route handler for the /api/profile/interests path (add or update the interests section in the current user's profile)
 */
router.put(
  "/interests",
  ensureAuthenticated,
  [
    body("interests")
      .isArray({ max: 100 })
      .withMessage("No more than 100 interests can be added to your profile")
      .bail()
      .custom((value, { req }) => {
        for (let element of req.body.interests) {
          if (
            typeof element !== "string" ||
            element.length === 0 ||
            element.length > 150
          ) {
            return false;
          }
        }
        return true;
      })
      .withMessage(
        "Individual interest entries need to be between 1 and 150 characters long"
      )
      .bail()
      .customSanitizer((value, { req }) => {
        let interests = value.map((interest) => String(interest).trim());
        return interests;
      }),
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
            error: {
              msg: "Profile does not exist",
            },
          });
        } else {
          profile.interests = req.body.interests ? req.body.interests : "";
          return profile.save();
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

/**
 * @route PUT /api/profile/social
 * @access private
 * @description Put request route handler for the /api/profile/social path (add or update the social links section in the current user's profile)
 */
router.put(
  "/social",
  ensureAuthenticated,
  [
    body("youtube")
      .if((value, { req }) => {
        return req.body.youtube;
      })
      .trim()
      .isURL({
        protocols: ["http", "https"],
        host_whitelist: ["www.youtube.com"],
      })
      .withMessage("Invalid URL")
      .bail()
      .customSanitizer((value, { req }) => {
        return addHttpsProtocolToValidatedSocialURLWithoutProtocol(value);
      }),
    body("twitter")
      .if((value, { req }) => {
        return req.body.twitter;
      })
      .trim()
      .isURL({
        protocols: ["http", "https"],
        host_whitelist: ["www.twitter.com"],
      })
      .withMessage("Invalid URL")
      .bail()
      .customSanitizer((value, { req }) => {
        return addHttpsProtocolToValidatedSocialURLWithoutProtocol(value);
      }),
    body("facebook")
      .if((value, { req }) => {
        return req.body.facebook;
      })
      .trim()
      .isURL({
        protocols: ["http", "https"],
        host_whitelist: ["www.facebook.com"],
      })
      .withMessage("Invalid URL")
      .bail()
      .customSanitizer((value, { req }) => {
        return addHttpsProtocolToValidatedSocialURLWithoutProtocol(value);
      }),
    body("linkedin")
      .if((value, { req }) => {
        return req.body.linkedin;
      })
      .trim()
      .isURL({
        protocols: ["http", "https"],
        host_whitelist: ["www.linkedin.com"],
      })
      .withMessage("Invalid URL")
      .bail()
      .customSanitizer((value, { req }) => {
        return addHttpsProtocolToValidatedSocialURLWithoutProtocol(value);
      }),
    body("instagram")
      .if((value, { req }) => {
        return req.body.instagram;
      })
      .trim()
      .isURL({
        protocols: ["http", "https"],
        host_whitelist: ["www.instagram.com"],
      })
      .withMessage("Invalid URL")
      .bail()
      .customSanitizer((value, { req }) => {
        return addHttpsProtocolToValidatedSocialURLWithoutProtocol(value);
      }),
    body("github")
      .if((value, { req }) => {
        return req.body.github;
      })
      .trim()
      .isURL({
        protocols: ["http", "https"],
        host_whitelist: ["www.github.com"],
      })
      .withMessage("Invalid URL")
      .bail()
      .customSanitizer((value, { req }) => {
        return addHttpsProtocolToValidatedSocialURLWithoutProtocol(value);
      }),
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
            error: {
              msg: "Profile does not exist",
            },
          });
        } else {
          const editedSocial = {};

          if (req.body.youtube) {
            editedSocial.youtube = req.body.youtube ? req.body.youtube : null;
          }
          if (req.body.twitter) {
            editedSocial.twitter = req.body.twitter ? req.body.twitter : null;
          }
          if (req.body.facebook) {
            editedSocial.facebook = req.body.facebook
              ? req.body.facebook
              : null;
          }
          if (req.body.linkedin) {
            editedSocial.linkedin = req.body.linkedin
              ? req.body.linkedin
              : null;
          }
          if (req.body.instagram) {
            editedSocial.instagram = req.body.instagram
              ? req.body.instagram
              : null;
          }
          if (req.body.github) {
            editedSocial.github = req.body.github ? req.body.github : null;
          }

          profile.social = editedSocial;
          return profile.save();
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

/**
 * @route PUT /api/profile/github
 * @access private
 * @description Put request route handler for the /api/profile/github path (add or update the current user's github username)
 */
router.put(
  "/github",
  ensureAuthenticated,
  [
    body("githubUsername")
      .if((value, { req }) => {
        return req.body.githubUsername;
      })
      .trim()
      .isLength({ max: 39 })
      .withMessage(
        "GitHub username needs to be between 1 and 39 characters long"
      )
      .bail()
      .custom((value, { req }) => {
        return value.match("^[A-Za-z0-9-]+$");
      })
      .withMessage(
        "GitHub username can only contain letters, numbers, and hyphens"
      )
      .bail()
      .custom((value, { req }) => {
        if (
          value.startsWith("-") ||
          value.endsWith("-") ||
          value.includes("--")
        ) {
          return false;
        }
        return true;
      })
      .withMessage(
        "GitHub username cannot begin or end with a hyphen or have multiple consecutive hyphens"
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
            error: {
              msg: "Profile does not exist",
            },
          });
        } else {
          profile.githubUsername = req.body.githubUsername
            ? req.body.githubUsername
            : "";
          return profile.save();
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

/**
 * @route PUT /api/profile/experience/:experience_id
 * @access private
 * @description PUT request route handler for the /api/profile/experience/:experience_id path (update an experience entry from the current user's profile)
 */
router.put(
  "/experience/:experience_id",
  ensureAuthenticated,
  [
    body("title")
      .not()
      .isEmpty()
      .withMessage("Title is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage("Title needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Title can only contain ASCII characters")
      .bail()
      .trim(),
    body("company")
      .not()
      .isEmpty()
      .withMessage("Company is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage("Company needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Company can only contain ASCII characters")
      .bail()
      .trim(),
    body("location")
      .if((value, { req }) => {
        return req.body.location;
      })
      .isLength({ max: 150 })
      .withMessage("Location needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Location can only contain ASCII characters")
      .bail()
      .trim(),
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
    body("description")
      .if((value, { req }) => {
        return req.body.description;
      })
      .isLength({ max: 2500 })
      .withMessage("Description needs to be between 0 and 2500 characters long")
      .bail()
      .isAscii()
      .withMessage("Description can only contain ASCII characters")
      .bail()
      .trim()
      .customSanitizer((value, { req }) => {
        return sanitizeQuillInput(value);
      }),
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
            error: {
              msg: "Profile does not exist",
            },
          });
        } else {
          const editedExperience = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description,
          };

          const experienceIndex = profile.experience
            .map((experience) => {
              return experience.id;
            })
            .indexOf(req.params.experience_id);

          if (experienceIndex >= 0) {
            profile.experience[experienceIndex] = Object.assign(
              profile.experience[experienceIndex],
              editedExperience
            );
            profile.experience.sort(compareDates);
            return profile.save();
          } else {
            res.status(404).json({
              error: {
                msg: "Experience does not exist",
              },
            });
          }
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

/**
 * @route PUT /api/profile/education/:education_id
 * @access private
 * @description Put request route handler for the /api/profile/education/:education_id path (update an education entry from the current user's profile)
 */
router.put(
  "/education/:education_id",
  ensureAuthenticated,
  [
    body("school")
      .not()
      .isEmpty()
      .withMessage("School is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage("School needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("School can only contain ASCII characters")
      .bail()
      .trim(),
    body("degree")
      .not()
      .isEmpty()
      .withMessage("Degree is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage("Degree needs to be between 1 and 150 characters long")
      .bail()
      .isAscii()
      .withMessage("Degree can only contain ASCII characters")
      .bail()
      .trim(),
    body("fieldOfStudy")
      .not()
      .isEmpty()
      .withMessage("Field of study is required")
      .bail()
      .isLength({ max: 150 })
      .withMessage(
        "Field of study needs to be between 1 and 150 characters long"
      )
      .bail()
      .isAscii()
      .withMessage("Field of study can only contain ASCII characters")
      .bail()
      .trim(),
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
    body("description")
      .if((value, { req }) => {
        return req.body.description;
      })
      .isLength({ max: 2500 })
      .withMessage("Description needs to be between 0 and 2500 characters long")
      .bail()
      .isAscii()
      .withMessage("Description can only contain ASCII characters")
      .bail()
      .trim()
      .customSanitizer((value, { req }) => {
        return sanitizeQuillInput(value);
      }),
    body("activities")
      .if((value, { req }) => {
        return req.body.activities;
      })
      .isLength({ max: 2500 })
      .withMessage(
        "Clubs and activities needs to be between 0 and 2500 characters long"
      )
      .bail()
      .isAscii()
      .withMessage("Clubs and activities can only contain ASCII characters")
      .bail()
      .trim()
      .customSanitizer((value, { req }) => {
        return sanitizeQuillInput(value);
      }),
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
            error: {
              msg: "Profile does not exist",
            },
          });
        } else {
          const editedEducation = {
            school: req.body.school,
            degree: req.body.degree,
            fieldOfStudy: req.body.fieldOfStudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description,
            activities: req.body.activities,
          };

          const educationIndex = profile.education
            .map((education) => {
              return education.id;
            })
            .indexOf(req.params.education_id);

          if (educationIndex >= 0) {
            profile.education[educationIndex] = Object.assign(
              profile.education[educationIndex],
              editedEducation
            );
            profile.education.sort(compareDates);
            return profile.save();
          } else {
            res.status(404).json({
              error: {
                msg: "Education does not exist",
              },
            });
          }
        }
      })
      .then((profile) => {
        return profile
          .populate("user", ["firstName", "lastName", "picture"])
          .execPopulate();
      })
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

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
          error: {
            msg: "Profile does not exist",
          },
        });
      } else {
        const educationIndex = profile.education
          .map((education) => {
            return education.id;
          })
          .indexOf(req.params.education_id);

        if (educationIndex === -1) {
          throw new Error("Invalid education_id");
        }

        profile.education.splice(educationIndex, 1);
        return profile.save();
      }
    })
    .then((profile) => {
      return profile
        .populate("user", ["firstName", "lastName", "picture"])
        .execPopulate();
    })
    .then((profile) => {
      res.json(profile);
    })
    .catch((err) => {
      res.status(500).json({
        error: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
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
          error: {
            msg: "Profile does not exist",
          },
        });
      } else {
        const experienceIndex = profile.experience
          .map((experience) => {
            return experience.id;
          })
          .indexOf(req.params.experience_id);

        if (experienceIndex === -1) {
          throw new Error("Invalid experience_id");
        }

        profile.experience.splice(experienceIndex, 1);
        return profile.save();
      }
    })
    .then((profile) => {
      return profile
        .populate("user", ["firstName", "lastName", "picture"])
        .execPopulate();
    })
    .then((profile) => {
      res.json(profile);
    })
    .catch((err) => {
      res.status(500).json({
        error: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    });
});

module.exports = router;
