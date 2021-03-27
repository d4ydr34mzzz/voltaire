module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      return res.status(401).json({ errors: [{ msg: "Not authenticated" }] });
    }
  },
  safelyReturnCurrentUsersDocument: function (req, res, next) {
    // *** Important reference: https://stackoverflow.com/questions/59690923/handlebars-access-has-been-denied-to-resolve-the-property-from-because-it-is *** //
    if (res.locals.user === undefined) {
      return res.status(500).json({
        error: {
          msg:
            "There was an issue processing the request. Please try again later.",
        },
      });
    } else {
      let user = res.locals.user;
      const newUserObject = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        internalAuth: user.internalAuth ? user.internalAuth._id : null,
        externalAuth: user.externalAuth ? user.externalAuth : null,
        picture: user.picture,
        profilePicturePublicId: user.profilePicturePublicId,
        profilePicture: user.profilePicture,
        profilePictureCroppingRectangle: user.profilePictureCroppingRectangle,
        coverImagePublicId: user.coverImagePublicId,
        coverImage: user.coverImage,
        coverImageCroppingRectangle: user.coverImageCroppingRectangle,
        fullName: user.firstName + " " + user.lastName,
        joined: user.joined,
      };

      res.json(newUserObject);
    }
  },
};
