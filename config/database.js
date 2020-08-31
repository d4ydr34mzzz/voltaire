if (process.env.NODE_ENV === "production") {
  module.exports = { mongoURI: process.env.MONGO_URI_PROD };
} else {
  module.exports = { mongoURI: process.env.MONGO_URI_DEV };
}
