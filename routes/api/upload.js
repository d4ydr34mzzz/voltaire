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
  cloudinaryUploadStreamMethod,
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

// Multer memory storage engine
const storage = multer.memoryStorage();

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

// Specify limits on the incoming data for profile pictures (Multer)
const profilePictureLimits = {
  fields: 3,
  fileSize: 10 * 1024 * 1024 /* 10 MiB */,
  files: 2,
  parts: 5,
};

// Specify which files are accepted for cover images (Multer)
const coverImageFileFilter = function (req, file, cb) {
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

// Specify limits on the incoming data for cover images (Multer)
const coverImageLimits = {
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

// Multer configuration for handling cover images
const uploadCoverImage = multer({
  storage: storage,
  fileFilter: coverImageFileFilter,
  limits: coverImageLimits,
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "coverImageCropped", maxCount: 1 },
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
              error: {
                msg: "Profile does not exist",
              },
            });
          }

          return User.findOne({ _id: req.user.id }).then((user) => {
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

            return Promise.all([promise1]).then((values) => {
              return cloudinaryUploadStreamMethod(
                req.files["profilePictureCropped"][0].buffer,
                { allowed_formats: ["jpg", "jpeg", "png"] }
              ).then((result) => {
                if (result && result.public_id && result.secure_url) {
                  user.profilePictureCroppingRectangle =
                    req.body.croppingRectangle;

                  profile.profilePictureCroppedPublicId = result.public_id;
                  profile.profilePictureCropped = result.secure_url;

                  return mongoose.startSession().then((session) => {
                    let updatedProfile = null;
                    let fn = () => {
                      return new Promise((resolve, reject) => {
                        return profile
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
                  throw new Error(
                    "Cloudinary response not formatted correctly"
                  );
                }
              });
            });
          });
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
              error: {
                msg: "Profile does not exist",
              },
            });
          }

          return User.findOne({ _id: req.user.id }).then((user) => {
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

            return Promise.all([promise1, promise2]).then((values) => {
              let promise1 = cloudinaryUploadStreamMethod(
                req.files["profilePicture"][0].buffer,
                { type: "private", allowed_formats: ["jpg", "jpeg", "png"] }
              );

              let promise2 = cloudinaryUploadStreamMethod(
                req.files["profilePictureCropped"][0].buffer,
                { allowed_formats: ["jpg", "jpeg", "png"] }
              );

              return Promise.all([promise1, promise2]).then((values) => {
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

                  return mongoose.startSession().then((session) => {
                    let updatedProfile = null;
                    let fn = () => {
                      return new Promise((resolve, reject) => {
                        return profile
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
                  throw new Error(
                    "Cloudinary response not formatted correctly"
                  );
                }
              });
            });
          });
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
              error: {
                msg: "Profile does not exist",
              },
            });
          }

          return User.findOne({ _id: req.user.id }).then((user) => {
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

            return Promise.all([promise1, promise2]).then((values) => {
              user.profilePicturePublicId = "";
              user.profilePicture = "";
              user.profilePictureCroppingRectangle = "";

              profile.profilePictureCroppedPublicId = "";
              profile.profilePictureCropped = "";

              return mongoose.startSession().then((session) => {
                let updatedProfile = null;
                let fn = () => {
                  return new Promise((resolve, reject) => {
                    return profile
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
            });
          });
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
 * @route PUT /api/upload/cover-image
 * @access private
 * @description Put request route handler for the /api/upload/cover-image path (upload a cover image for the current user)
 */
router.put(
  "/cover-image",
  ensureAuthenticated,
  parseFormDataUsingMulter(uploadCoverImage) /* validates file type and size */,
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
        coverImage: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    }

    let fieldNamesInSubmission = Object.keys(req.files);
    let numberOfFilesInSubmission =
      fieldNamesInSubmission.length; /* "maxCount: 1" in the uploadCoverImage multer configuration ensures that each field only has one file */

    if (!(numberOfFilesInSubmission >= 0 && numberOfFilesInSubmission <= 2)) {
      return res.status(400).json({
        coverImage: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    }

    if (
      numberOfFilesInSubmission === 1 &&
      fieldNamesInSubmission[0] !== "coverImageCropped"
    ) {
      return res.status(400).json({
        coverImage: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    }

    if (numberOfFilesInSubmission === 2) {
      let requiredFieldNames = ["coverImage", "coverImageCropped"];

      if (
        !requiredFieldNames.every((fieldName) =>
          fieldNamesInSubmission.includes(fieldName)
        )
      ) {
        return res.status(400).json({
          coverImage: {
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

    if (numberOfFilesInSubmission && !croppingRectangleProvided) {
      return res.status(400).json({
        coverImage: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    } else if (numberOfFilesInSubmission === 1 && croppingRectangleProvided) {
      /* User wants to adjust existing cover image (if it exists)
       * Check user document has a coverImage defined (return error if not defined)
       */

      Profile.findOne({ user: req.user.id })
        .then((profile) => {
          if (!profile) {
            return res.status(404).json({
              error: {
                msg: "Profile does not exist",
              },
            });
          }

          return User.findOne({ _id: req.user.id }).then((user) => {
            if (!(user.coverImagePublicId && user.coverImage)) {
              return res.status(400).json({
                coverImage: {
                  msg:
                    "There was an issue processing the request. Please try again later.",
                },
              });
            }

            let promise1 = Promise.resolve();
            if (
              profile.coverImageCroppedPublicId &&
              profile.coverImageCropped
            ) {
              promise1 = cloudinaryDestroyMethod(
                profile.coverImageCroppedPublicId,
                {
                  invalidate: "true",
                }
              );
            }

            return Promise.all([promise1]).then((values) => {
              return cloudinaryUploadStreamMethod(
                req.files["coverImageCropped"][0].buffer,
                {
                  allowed_formats: ["jpg", "jpeg", "png"],
                }
              ).then((result) => {
                if (result && result.public_id && result.secure_url) {
                  user.coverImageCroppingRectangle = req.body.croppingRectangle;

                  profile.coverImageCroppedPublicId = result.public_id;
                  profile.coverImageCropped = result.secure_url;

                  return mongoose.startSession().then((session) => {
                    let updatedProfile = null;
                    let fn = () => {
                      return new Promise((resolve, reject) => {
                        return profile
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
                  throw new Error(
                    "Cloudinary response not formatted correctly"
                  );
                }
              });
            });
          });
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
            coverImage: {
              msg:
                "There was an issue processing the request. Please try again later.",
            },
          });
        });
    } else if (numberOfFilesInSubmission === 2 && croppingRectangleProvided) {
      /* User wants to upload a new cover image
       * Delete the previous cover images from Cloudinary if they exist
       */

      Profile.findOne({ user: req.user.id })
        .then((profile) => {
          if (!profile) {
            return res.status(404).json({
              error: {
                msg: "Profile does not exist",
              },
            });
          }

          return User.findOne({ _id: req.user.id }).then((user) => {
            let promise1 = Promise.resolve();
            let promise2 = Promise.resolve();
            if (user.coverImagePublicId && user.coverImage) {
              promise1 = cloudinaryDestroyMethod(user.coverImagePublicId, {
                type: "private",
                invalidate: "true",
              });
            }
            if (
              profile.coverImageCroppedPublicId &&
              profile.coverImageCropped
            ) {
              promise2 = cloudinaryDestroyMethod(
                profile.coverImageCroppedPublicId,
                {
                  invalidate: "true",
                }
              );
            }

            return Promise.all([promise1, promise2]).then((values) => {
              let promise1 = cloudinaryUploadStreamMethod(
                req.files["coverImage"][0].buffer,
                { type: "private", allowed_formats: ["jpg", "jpeg", "png"] }
              );

              let promise2 = cloudinaryUploadStreamMethod(
                req.files["coverImageCropped"][0].buffer,
                { allowed_formats: ["jpg", "jpeg", "png"] }
              );

              return Promise.all([promise1, promise2]).then((values) => {
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
                  user.coverImagePublicId = result1.public_id;
                  user.coverImage = result1.secure_url;
                  user.coverImageCroppingRectangle = req.body.croppingRectangle;

                  profile.coverImageCroppedPublicId = result2.public_id;
                  profile.coverImageCropped = result2.secure_url;

                  return mongoose.startSession().then((session) => {
                    let updatedProfile = null;
                    let fn = () => {
                      return new Promise((resolve, reject) => {
                        return profile
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
                  throw new Error(
                    "Cloudinary response not formatted correctly"
                  );
                }
              });
            });
          });
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
            coverImage: {
              msg:
                "There was an issue processing the request. Please try again later.",
            },
          });
        });
    } else if (numberOfFilesInSubmission === 0 && !croppingRectangleProvided) {
      /* User wants to remove an existing cover image (if it exists) */

      Profile.findOne({ user: req.user.id })
        .then((profile) => {
          if (!profile) {
            return res.status(404).json({
              error: {
                msg: "Profile does not exist",
              },
            });
          }

          return User.findOne({ _id: req.user.id }).then((user) => {
            let promise1 = Promise.resolve();
            let promise2 = Promise.resolve();
            if (user.coverImagePublicId && user.coverImage) {
              promise1 = cloudinaryDestroyMethod(user.coverImagePublicId, {
                type: "private",
                invalidate: "true",
              });
            }
            if (
              profile.coverImageCroppedPublicId &&
              profile.coverImageCropped
            ) {
              promise2 = cloudinaryDestroyMethod(
                profile.coverImageCroppedPublicId,
                {
                  invalidate: "true",
                }
              );
            }

            return Promise.all([promise1, promise2]).then((values) => {
              user.coverImagePublicId = "";
              user.coverImage = "";
              user.coverImageCroppingRectangle = "";

              profile.coverImageCroppedPublicId = "";
              profile.coverImageCropped = "";

              return mongoose.startSession().then((session) => {
                let updatedProfile = null;
                let fn = () => {
                  return new Promise((resolve, reject) => {
                    return profile
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
            });
          });
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
            coverImage: {
              msg:
                "There was an issue processing the request. Please try again later.",
            },
          });
        });
    }
  }
);

module.exports = router;
