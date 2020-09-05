module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      return res.status(401).json({ errors: [{ msg: "Not authenticated" }] });
    }
  },
};
