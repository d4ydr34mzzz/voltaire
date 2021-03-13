const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseAlgolia = require("mongoose-algolia");
const algoliaIndexName = require("../config/algolia.js");
require("dotenv").config();

/**
 * Define the profile schema
 * References:
 * {@link https://mongoosejs.com/docs/populate.html}
 * {@link https://mongoosejs.com/docs/schematypes.html#dates}
 */
const profileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  handle: {
    type: String,
    required: true,
    maxlength: 40,
  },
  company: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  header: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
  },
  interests: {
    type: [String],
  },
  bio: {
    type: String,
  },
  githubUsername: {
    type: String,
  },
  profilePictureCroppedPublicId: {
    type: String,
    default: "",
  },
  profilePictureCropped: {
    type: String,
    default: "",
  },
  coverImageCroppedPublicId: {
    type: String,
    default: "",
  },
  coverImageCropped: {
    type: String,
    default: "",
  },
  experience: [
    {
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldOfStudy: {
        type: String,
        required: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
      activities: {
        type: String,
      },
    },
  ],
  social: {
    youtube: {
      type: String,
    },
    twitter: {
      type: String,
    },
    facebook: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

profileSchema.plugin(mongooseAlgolia, {
  appId: process.env.ALGOLIA_APPLICATION_ID,
  apiKey: process.env.ALGOLIA_ADMIN_API_KEY,
  indexName: algoliaIndexName,
  selector:
    "name handle location header skills githubUsername profilePictureCropped experience education user.picture",
  populate: {
    path: "user",
    selector: "picture",
  },
  mappings: {
    experience: function (value) {
      let experiences = [];
      if (Array.isArray(value)) {
        experiences = value.map((entry) => {
          return (({ title, company }) => ({ title, company }))(entry);
        });
      }
      return experiences;
    },
    education: function (value) {
      let education = [];
      if (Array.isArray(value)) {
        education = value.map((entry) => {
          return (({ school, degree, fieldOfStudy }) => ({
            school,
            degree,
            fieldOfStudy,
          }))(entry);
        });
      }
      return education;
    },
  },
  virtuals: {
    name: function (doc) {
      return `${doc.firstName} ${doc.lastName}`;
    },
  },
});

// Convert the profileSchema into a model we can work with
let model = mongoose.model("Profile", profileSchema);
// model.SyncToAlgolia();
