module.exports = {
  addHttpsProtocolToValidatedSocialURL: function (value) {
    let url = String(value);
    if (!(url.startsWith("http") || url.startsWith("https"))) {
      return "https://" + url;
    }
    return value;
  },
};
