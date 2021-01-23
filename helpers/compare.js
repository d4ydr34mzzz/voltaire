module.exports = {
  compareDates: function (a, b) {
    if (a.current && b.current) {
      return b.from - a.from;
    }

    if (a.current) {
      return -1;
    }

    if (b.current) {
      return 1;
    }

    return b.to - a.to;
  },
};
