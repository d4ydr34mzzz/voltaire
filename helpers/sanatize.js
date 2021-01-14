const sanitizeHtml = require("sanitize-html");

module.exports = {
  addHttpsProtocolToValidatedSocialURL: function (value) {
    let url = String(value);
    if (!(url.startsWith("http") || url.startsWith("https"))) {
      return "https://" + url;
    }
    return value;
  },
  sanitizeQuillInput: function (value) {
    const dirty = value;
    const clean = sanitizeHtml(dirty, {
      allowedTags: ["b", "em", "strong", "br", "p", "ol", "ul", "li"],
      disallowedTagsMode: "discard",
      allowedClasses: {
        "*": [
          "ql-indent-1",
          "ql-indent-2",
          "ql-indent-3",
          "ql-indent-4",
          "ql-indent-5",
          "ql-indent-6",
          "ql-indent-7",
          "ql-indent-8",
        ],
      },
      transformTags: {
        "*": function (tagName, attribs) {
          if (
            attribs &&
            attribs.class &&
            attribs.class.match(".*(ql-indent-[4-8])+.*")
          ) {
            return {
              tagName: tagName,
              attribs: {
                class: "ql-indent-3",
              },
            };
          } else {
            return {
              tagName: tagName,
              attribs: attribs,
            };
          }
        },
      },
      exclusiveFilter: function (frame) {
        return frame.tag === "p" && !frame.text && frame.tagPosition === 0;
      },
    });
    return clean;
  },
};
