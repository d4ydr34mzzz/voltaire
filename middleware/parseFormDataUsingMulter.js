const multer = require("multer");

module.exports = {
  parseFormDataUsingMulter: function (multerUploadFunction) {
    return function (req, res, next) {
      multerUploadFunction(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case "LIMIT_FILE_SIZE":
              return res.status(400).json({
                profilePicture: {
                  msg: "File too large",
                },
              });
            case "LIMIT_FILE_COUNT":
              return res.status(400).json({
                profilePicture: {
                  msg: "Too many files",
                },
              });
            default:
              return res.status(400).json({
                profilePicture: {
                  msg:
                    "There was an issue processing the request. Please try again later.",
                },
              });
          }
        } else if (err) {
          return res.status(500).json({
            profilePicture: {
              msg:
                "There was an issue processing the request. Please try again later.",
            },
          });
        }

        next();
      });
    };
  },
};
