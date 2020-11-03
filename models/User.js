const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * References:
 * {@link https://stackoverflow.com/questions/11101955/mongodb-schema-design-for-multiple-auth-user-accounts}
 * {@link https://stackoverflow.com/questions/42608919/mongoose-user-model-for-handling-local-and-social-auth-providers}
 * {@link http://www.passportjs.org/docs/profile/}
 */

const internalAccountSchema = new Schema({
  password: {
    type: String,
    required: true,
  },
});

const externalAccountSchema = new Schema({
  provider: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

// Define the user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  // Single nested subdocument
  internalAuth: internalAccountSchema,
  // Single nested subdocument
  externalAuth: externalAccountSchema,
  picture: {
    type: String,
    require: true,
  },
  profilePicturePublicId: {
    type: String,
    default: "",
  },
  profilePicture: {
    type: String,
    default: "",
  },
  profilePictureCroppingRectangle: {
    type: String,
    default: "",
  },
  joined: {
    type: Date,
    default: Date.now,
  },
});

// Convert the userSchema into a model we can work with
mongoose.model("User", userSchema);
