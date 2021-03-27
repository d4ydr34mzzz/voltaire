module.exports = {
  passportLoginMethod: function (req, user) {
    return new Promise((resolve, reject) => {
      req.login(user, function (error) {
        if (error) {
          reject(error);
        }

        resolve();
      });
    });
  },
};
