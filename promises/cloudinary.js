const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

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
  /* Reference: https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud */
  cloudinaryUploadStreamMethod: function (file, options) {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(file).pipe(stream);
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
      cloudinary.uploader.explicit(
        public_id,
        options,
        function (error, result) {
          if (error) {
            reject(error);
          }

          resolve(result);
        }
      );
    });
  },
};
