const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const { ensureAuthenticated } = require("../../helpers/auth.js");
const {
  parseFormDataUsingMulter,
} = require("../../middleware/parseFormDataUsingMulter.js");
const { cloudinary } = require("../../config/cloudinary.js");
const {
  cloudinaryUploadMethod,
  cloudinaryDestroyMethod,
} = require("../../promises/cloudinary.js");
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

// Multer disk storage engine
const storage = multer.diskStorage({
  destination: "./public/tmp/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Specify which files are accepted for profile pictures (Multer)
const profilePictureFileFilter = function (req, file, cb) {
  let allowedExtensions = /(jpe?g|png)$/i;

  if (
    allowedExtensions.test(path.extname(file.originalname)) &&
    allowedExtensions.test(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

// Specify limits on the incoming data (Multer)
const profilePictureLimits = {
  fields: 3,
  fileSize: 10 * 1024 * 1024 /* 10 MiB */,
  files: 2,
  parts: 5,
};

// Multer configuration for handling profile pictures
const uploadProfilePicture = multer({
  storage: storage,
  fileFilter: profilePictureFileFilter,
  limits: profilePictureLimits,
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "profilePictureCropped", maxCount: 1 },
]);

/**
 * @route GET /api/upload/test
 * @access public
 * @description Get request route handler for the /api/upload/test path (check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "upload" });
});

/**
 * @route PUT /api/upload/profile-picture
 * @access private
 * @description Put request route handler for the /api/upload/profile-picture path (upload a profile picture for the current user)
 */
router.put(
  "/profile-picture",
  ensureAuthenticated,
  parseFormDataUsingMulter(
    uploadProfilePicture
  ) /* validates file type and size */,
  [
    body("croppingRectangle")
      .not()
      .isEmpty()
      .if((value, { req }) => {
        if (value === "undefined") {
          return false;
        }

        return true;
      })
      .custom((value, { req }) => {
        let croppingRectangle = JSON.parse(value);
        return (
          croppingRectangle.hasOwnProperty("x") &&
          croppingRectangle.x >= 0 &&
          croppingRectangle.x <= 1 &&
          croppingRectangle.hasOwnProperty("y") &&
          croppingRectangle.y >= 0 &&
          croppingRectangle.y <= 1 &&
          croppingRectangle.hasOwnProperty("width") &&
          croppingRectangle.width >= 0 &&
          croppingRectangle.width <= 1 &&
          croppingRectangle.hasOwnProperty("height") &&
          croppingRectangle.height >= 0 &&
          croppingRectangle.height <= 1
        );
      }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        profilePicture: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    }

    let fieldNamesInSubmission = Object.keys(req.files);
    let numberOfFilesInSubmission =
      fieldNamesInSubmission.length; /* "maxCount: 1" in the uploadProfilePicture multer configuration ensures that each field only has one file */

    if (!(numberOfFilesInSubmission >= 0 && numberOfFilesInSubmission <= 2)) {
      return res.status(400).json({
        profilePicture: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    }

    if (
      numberOfFilesInSubmission === 1 &&
      fieldNamesInSubmission[0] !== "profilePictureCropped"
    ) {
      return res.status(400).json({
        profilePicture: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    }

    if (numberOfFilesInSubmission === 2) {
      let requiredFieldNames = ["profilePicture", "profilePictureCropped"];

      if (
        !requiredFieldNames.every((fieldName) =>
          fieldNamesInSubmission.includes(fieldName)
        )
      ) {
        return res.status(400).json({
          profilePicture: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      }
    }

    // TODO: Create a sanitization function to set croppingRectangle to undefined

    let croppingRectangleProvided = !(
      req.body.croppingRectangle === "undefined"
    );

    // TODO: In the case when a file is provided remove it after saving it to Cloudinary

    if (numberOfFilesInSubmission && !croppingRectangleProvided) {
      return res.status(400).json({
        profilePicture: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    } else if (numberOfFilesInSubmission === 1 && croppingRectangleProvided) {
      /* User wants to adjust existing profile image (if it exists)
       * Check user document has a profilePicture defined (return error if not defined)
       */

      Profile.findOne({ user: req.user.id })
        .then((profile) => {
          if (!profile) {
            return res.status(404).json({
              errors: [
                {
                  msg: "Profile does not exist",
                },
              ],
            });
          }

          User.findOne({ _id: req.user.id }).then((user) => {
            if (!(user.profilePicturePublicId && user.profilePicture)) {
              return res.status(400).json({
                profilePicture: {
                  msg:
                    "There was an issue processing the request. Please try again later.",
                },
              });
            }

            let promise1 = Promise.resolve();
            if (
              profile.profilePictureCroppedPublicId &&
              profile.profilePictureCropped
            ) {
              promise1 = cloudinaryDestroyMethod(
                profile.profilePictureCroppedPublicId,
                {
                  invalidate: "true",
                }
              );
            }

            Promise.all([promise1]).then((values) => {
              cloudinaryUploadMethod(
                req.files["profilePictureCropped"][0].path,
                { allowed_formats: ["jpg", "jpeg", "png"] }
              ).then((result) => {
                if (result && result.public_id && result.secure_url) {
                  user.profilePictureCroppingRectangle =
                    req.body.croppingRectangle;

                  profile.profilePictureCroppedPublicId = result.public_id;
                  profile.profilePictureCropped = result.secure_url;

                  let promise1 = user.save();

                  let promise2 = new Promise((resolve, reject) => {
                    /* References:
                     * https://stackoverflow.com/a/52249411
                     * https://stackoverflow.com/a/45490618
                     * https://stackoverflow.com/a/51431746
                     */
                    profile.save((err, profile) => {
                      if (err) {
                        return reject("Could not save the updated profile");
                      }

                      return resolve(
                        profile
                          .populate("user", [
                            "firstName",
                            "lastName",
                            "picture",
                          ])
                          .execPopulate()
                      );
                    });
                  });

                  Promise.all([promise1, promise2]).then((values) => {
                    return res.json(values[1]);
                  });
                } else {
                  return Promise.reject(
                    "Cloudinary response not formatted correctly"
                  );
                }
              });
            });
          });
        })
        .catch((err) => {
          res.status(500).json({
            profilePicture: {
              msg:
                "There was an issue processing the request. Please try again later.",
            },
          });
        });
    } else if (numberOfFilesInSubmission === 2 && croppingRectangleProvided) {
      /* User wants to upload a new profile image
       * Delete the previous profile pictures from Cloudinary if they exist
       */

      Profile.findOne({ user: req.user.id })
        .then((profile) => {
          if (!profile) {
            return res.status(404).json({
              errors: [
                {
                  msg: "Profile does not exist",
                },
              ],
            });
          }

          User.findOne({ _id: req.user.id }).then((user) => {
            let promise1 = Promise.resolve();
            let promise2 = Promise.resolve();
            if (user.profilePicturePublicId && user.profilePicture) {
              promise1 = cloudinaryDestroyMethod(user.profilePicturePublicId, {
                type: "private",
                invalidate: "true",
              });
            }
            if (
              profile.profilePictureCroppedPublicId &&
              profile.profilePictureCropped
            ) {
              promise2 = cloudinaryDestroyMethod(
                profile.profilePictureCroppedPublicId,
                {
                  invalidate: "true",
                }
              );
            }

            Promise.all([promise1, promise2]).then((values) => {
              let promise1 = cloudinaryUploadMethod(
                req.files["profilePicture"][0].path,
                { type: "private", allowed_formats: ["jpg", "jpeg", "png"] }
              );

              let promise2 = cloudinaryUploadMethod(
                req.files["profilePictureCropped"][0].path,
                { allowed_formats: ["jpg", "jpeg", "png"] }
              );

              Promise.all([promise1, promise2]).then((values) => {
                let result1 = values[0];
                let result2 = values[1];

                if (
                  result1 &&
                  result1.public_id &&
                  result1.secure_url &&
                  result2 &&
                  result2.public_id &&
                  result2.secure_url
                ) {
                  user.profilePicturePublicId = result1.public_id;
                  user.profilePicture = result1.secure_url;
                  user.profilePictureCroppingRectangle =
                    req.body.croppingRectangle;

                  profile.profilePictureCroppedPublicId = result2.public_id;
                  profile.profilePictureCropped = result2.secure_url;

                  let promise1 = user.save();

                  let promise2 = new Promise((resolve, reject) => {
                    /* References:
                     * https://stackoverflow.com/a/52249411
                     * https://stackoverflow.com/a/45490618
                     * https://stackoverflow.com/a/51431746
                     */
                    profile.save((err, profile) => {
                      if (err) {
                        return reject("Could not save the updated profile");
                      }

                      return resolve(
                        profile
                          .populate("user", [
                            "firstName",
                            "lastName",
                            "picture",
                          ])
                          .execPopulate()
                      );
                    });
                  });

                  Promise.all([promise1, promise2]).then((values) => {
                    return res.json(values[1]);
                  });
                } else {
                  return Promise.reject(
                    "Cloudinary response not formatted correctly"
                  );
                }
              });
            });
          });
        })
        .catch((err) => {
          res.status(500).json({
            profilePicture: {
              msg:
                "There was an issue processing the request. Please try again later.",
            },
          });
        });
    } else if (numberOfFilesInSubmission === 0 && !croppingRectangleProvided) {
      /* User wants to remove an existing profile image (if it exists) */

      Profile.findOne({ user: req.user.id })
        .then((profile) => {
          if (!profile) {
            return res.status(404).json({
              errors: [
                {
                  msg: "Profile does not exist",
                },
              ],
            });
          }

          User.findOne({ _id: req.user.id }).then((user) => {
            let promise1 = Promise.resolve();
            let promise2 = Promise.resolve();
            if (user.profilePicturePublicId && user.profilePicture) {
              promise1 = cloudinaryDestroyMethod(user.profilePicturePublicId, {
                type: "private",
                invalidate: "true",
              });
            }
            if (
              profile.profilePictureCroppedPublicId &&
              profile.profilePictureCropped
            ) {
              promise2 = cloudinaryDestroyMethod(
                profile.profilePictureCroppedPublicId,
                {
                  invalidate: "true",
                }
              );
            }

            Promise.all([promise1, promise2]).then((values) => {
              user.profilePicturePublicId = "";
              user.profilePicture = "";
              user.profilePictureCroppingRectangle = "";

              profile.profilePictureCroppedPublicId = "";
              profile.profilePictureCropped = "";

              let promise1 = user.save();

              let promise2 = new Promise((resolve, reject) => {
                profile.save((err, profile) => {
                  if (err) {
                    return reject("Could not save the updated profile");
                  }

                  return resolve(
                    profile
                      .populate("user", ["firstName", "lastName", "picture"])
                      .execPopulate()
                  );
                });
              });

              Promise.all([promise1, promise2]).then((values) => {
                return res.json(values[1]);
              });
            });
          });
        })
        .catch((err) => {
          res.status(500).json({
            profilePicture: {
              msg:
                "There was an issue processing the request. Please try again later.",
            },
          });
        });
    }
  }
);

/**
 * @route POST /api/upload/cover
 * @access private
 * @description Post request route handler for the /api/upload/cover path (upload a cover image for the current user)
 */
router.post("/cover", ensureAuthenticated, (req, res) => {});

module.exports = router;
