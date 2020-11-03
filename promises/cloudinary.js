const cloudinary = require("cloudinary").v2;

// Reference: https://stackoverflow.com/questions/43701013/cloudinary-api-resolve-promise
module.exports = {
  cloudinaryUploadMethod: function (file, options) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file, options, function (error, result) {
        if (error) {
          reject(error);
        }

        resolve(result);
      });
    });
  },
  cloudinaryDestroyMethod: function (public_id, options) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, options, function (error, result) {
        if (error) {
          reject(error);
        }

        resolve(result);
      });
    });
  },
  cloudinaryExplicitMethod: function (public_id, options) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.explicit(public_id, options, function (
        error,
        result
      ) {
        if (error) {
          reject(error);
        }

        resolve(result);
      });
    });
  },
};
