import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  profile: null,
  profiles: null,
  fetch_current_users_profile_status: "idle",
  initialize_user_profile_status: "idle",
  add_experience_status: "idle",
  add_experience_errors: {},
  edit_experience_status: "idle",
  edit_experience_errors: {},
  delete_experience_status: "idle",
  delete_experience_errors: {},
  add_education_status: "idle",
  add_education_errors: {},
  edit_education_status: "idle",
  edit_education_errors: {},
  delete_education_status: "idle",
  delete_education_errors: {},
  edit_general_information_status: "idle",
  edit_general_information_errors: {},
  edit_profile_picture_status: "idle",
  edit_profile_picture_errors: {},
  edit_cover_image_status: "idle",
  edit_cover_image_errors: {},
  add_about_status: "idle",
  add_about_errors: {},
  add_skills_status: "idle",
  add_skills_errors: {},
  add_interests_status: "idle",
  add_interests_errors: {},
  add_social_links_status: "idle",
  add_social_links_errors: {},
  add_github_username_status: "idle",
  add_github_username_errors: {},
  errors: {},
};

export const fetchCurrentUsersProfile = createAsyncThunk(
  "profile/fetchCurrentUsersProfile",
  async (arg, { rejectWithValue }) => {
    try {
      let response = await axios.get("/api/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const initializeUserProfile = createAsyncThunk(
  "profile/initializeUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      let response = await axios.post("/api/profile", profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addExperience = createAsyncThunk(
  "profile/addExperience",
  async (experienceData, { rejectWithValue }) => {
    try {
      let response = await axios.post(
        "/api/profile/experience",
        experienceData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editExperience = createAsyncThunk(
  "profile/editExperience",
  async (experienceData, { rejectWithValue }) => {
    try {
      let response = await axios.put(
        `/api/profile/experience/${experienceData.entryId}`,
        experienceData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteExperience = createAsyncThunk(
  "profile/deleteExperience",
  async (experienceData, { rejectWithValue }) => {
    try {
      let response = await axios.delete(
        `/api/profile/experience/${experienceData.entryId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addEducation = createAsyncThunk(
  "profile/addEducation",
  async (educationData, { rejectWithValue }) => {
    try {
      let response = await axios.post("/api/profile/education", educationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editEducation = createAsyncThunk(
  "profile/editEducation",
  async (educationData, { rejectWithValue }) => {
    try {
      let response = await axios.put(
        `/api/profile/education/${educationData.entryId}`,
        educationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteEducation = createAsyncThunk(
  "profile/deleteEducation",
  async (educationData, { rejectWithValue }) => {
    try {
      let response = await axios.delete(
        `/api/profile/education/${educationData.entryId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editGeneralInformation = createAsyncThunk(
  "profile/editGeneralInformation",
  async (generalInformationData, { rejectWithValue }) => {
    try {
      let response = await axios.put(
        "/api/profile/general",
        generalInformationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editProfilePicture = createAsyncThunk(
  "profile/editProfilePicture",
  async (profilePictureData, { rejectWithValue }) => {
    try {
      let form = new FormData();
      for (let p in profilePictureData) {
        form.append(p, profilePictureData[p]);
      }

      let response = await axios({
        method: "put",
        url: "/api/upload/profile-picture",
        data: form,
        header: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editCoverImage = createAsyncThunk(
  "profile/editCoverImage",
  async (coverImageData, { rejectWithValue }) => {
    try {
      let form = new FormData();
      for (let p in coverImageData) {
        form.append(p, coverImageData[p]);
      }

      let response = await axios({
        method: "put",
        url: "/api/upload/cover-image",
        data: form,
        header: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addAbout = createAsyncThunk(
  "profile/addAbout",
  async (aboutData, { rejectWithValue }) => {
    try {
      let response = await axios.put("/api/profile/about", aboutData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addSkills = createAsyncThunk(
  "profile/addSkills",
  async (skillData, { rejectWithValue }) => {
    try {
      let response = await axios.put("api/profile/skills", skillData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addInterests = createAsyncThunk(
  "profile/addInterests",
  async (interestsData, { rejectWithValue }) => {
    try {
      let response = await axios.put("api/profile/interests", interestsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addSocialLinks = createAsyncThunk(
  "profile/addSocialLinks",
  async (socialData, { rejectWithValue }) => {
    try {
      let response = await axios.put("api/profile/social", socialData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addGitHubUsername = createAsyncThunk(
  "profile/addGitHubUsername",
  async (githubData, { rejectWithValue }) => {
    try {
      let response = await axios.put("api/profile/github", githubData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = {};
    },
    clearAddExperienceErrors: (state) => {
      state.add_experience_errors = {};
    },
    clearEditExperienceErrors: (state) => {
      state.edit_experience_errors = {};
    },
    clearDeleteExperienceErrors: (state) => {
      state.delete_experience_errors = {};
    },
    clearAddEducationErrors: (state) => {
      state.add_education_errors = {};
    },
    clearEditEducationErrors: (state) => {
      state.edit_education_errors = {};
    },
    clearDeleteEducationErrors: (state) => {
      state.delete_education_errors = {};
    },
    clearEditGeneralInformationErrors: (state) => {
      state.edit_general_information_errors = {};
    },
    clearEditProfilePictureErrors: (state) => {
      state.edit_profile_picture_errors = {};
    },
    clearEditCoverImageErrors: (state) => {
      state.edit_cover_image_errors = {};
    },
    clearAddAboutErrors: (state) => {
      state.add_about_errors = {};
    },
    clearAddSkillsErrors: (state) => {
      state.add_skills_errors = {};
    },
    clearAddInterestsErrors: (state) => {
      state.add_interests_errors = {};
    },
    clearAddSocialLinksErrors: (state) => {
      state.add_social_links_errors = {};
    },
    clearAddGitHubUsernameErrors: (state) => {
      state.add_github_username_errors = {};
    },
  },
  extraReducers: {
    [fetchCurrentUsersProfile.pending]: (state, action) => {
      state.fetch_current_users_profile_status = "loading";
    },
    [fetchCurrentUsersProfile.fulfilled]: (state, action) => {
      state.fetch_current_users_profile_status = "succeeded";
      state.profile = action.payload;
    },
    [fetchCurrentUsersProfile.rejected]: (state, action) => {
      state.fetch_current_users_profile_status = "failed";
      state.errors = action.payload;
      if (state.errors.profile) {
        state.profile = {};
      }
    },
    [initializeUserProfile.pending]: (state, action) => {
      state.initialize_user_profile_status = "loading";
    },
    [initializeUserProfile.fulfilled]: (state, action) => {
      state.initialize_user_profile_status = "succeeded";
      state.profile = action.payload;
    },
    [initializeUserProfile.rejected]: (state, action) => {
      state.initialize_user_profile_status = "failed";
      state.errors = action.payload;
    },
    [addExperience.pending]: (state, action) => {
      state.add_experience_status = "loading";
    },
    [addExperience.fulfilled]: (state, action) => {
      state.add_experience_status = "succeeded";
      state.profile = action.payload;
    },
    [addExperience.rejected]: (state, action) => {
      state.add_experience_status = "failed";
      state.add_experience_errors = action.payload;
    },
    [editExperience.pending]: (state, action) => {
      state.edit_experience_status = "loading";
    },
    [editExperience.fulfilled]: (state, action) => {
      state.edit_experience_status = "succeeded";
      state.profile = action.payload;
    },
    [editExperience.rejected]: (state, action) => {
      state.edit_experience_status = "failed";
      state.edit_experience_errors = action.payload;
    },
    [deleteExperience.pending]: (state, action) => {
      state.delete_experience_status = "loading";
    },
    [deleteExperience.fulfilled]: (state, action) => {
      state.delete_experience_status = "succeeded";
      state.profile = action.payload;
    },
    [deleteExperience.rejected]: (state, action) => {
      state.delete_experience_status = "failed";
      state.delete_experience_errors = action.payload;
    },
    [addEducation.pending]: (state, action) => {
      state.add_education_status = "loading";
    },
    [addEducation.fulfilled]: (state, action) => {
      state.add_education_status = "succeeded";
      state.profile = action.payload;
    },
    [addEducation.rejected]: (state, action) => {
      state.add_education_status = "failed";
      state.add_education_errors = action.payload;
    },
    [editEducation.pending]: (state, action) => {
      state.edit_education_status = "loading";
    },
    [editEducation.fulfilled]: (state, action) => {
      state.edit_education_status = "succeeded";
      state.profile = action.payload;
    },
    [editEducation.rejected]: (state, action) => {
      state.edit_education_status = "failed";
      state.edit_education_errors = action.payload;
    },
    [deleteEducation.pending]: (state, action) => {
      state.delete_education_status = "loading";
    },
    [deleteEducation.fulfilled]: (state, action) => {
      state.delete_education_status = "succeeded";
      state.profile = action.payload;
    },
    [deleteEducation.rejected]: (state, action) => {
      state.delete_education_status = "failed";
      state.delete_education_errors = action.payload;
    },
    [editGeneralInformation.pending]: (state, action) => {
      state.edit_general_information_status = "loading";
    },
    [editGeneralInformation.fulfilled]: (state, action) => {
      state.edit_general_information_status = "succeeded";
      state.profile = action.payload;
    },
    [editGeneralInformation.rejected]: (state, action) => {
      state.edit_general_information_status = "failed";
      state.edit_general_information_errors = action.payload;
    },
    [editProfilePicture.pending]: (state, action) => {
      state.edit_profile_picture_status = "loading";
    },
    [editProfilePicture.fulfilled]: (state, action) => {
      state.edit_profile_picture_status = "succeeded";
      state.profile = action.payload;
    },
    [editProfilePicture.rejected]: (state, action) => {
      state.edit_profile_picture_status = "failed";
      state.edit_profile_picture_errors = action.payload;
    },
    [editCoverImage.pending]: (state, action) => {
      state.edit_cover_image_status = "loading";
    },
    [editCoverImage.fulfilled]: (state, action) => {
      state.edit_cover_image_status = "succeeded";
      state.profile = action.payload;
    },
    [editCoverImage.rejected]: (state, action) => {
      state.edit_cover_image_status = "failed";
      state.edit_cover_image_errors = action.payload;
    },
    [addAbout.pending]: (state, action) => {
      state.add_about_status = "loading";
    },
    [addAbout.fulfilled]: (state, action) => {
      state.add_about_status = "succeeded";
      state.profile = action.payload;
    },
    [addAbout.rejected]: (state, action) => {
      state.add_about_status = "failed";
      state.add_about_errors = action.payload;
    },
    [addSkills.pending]: (state, action) => {
      state.add_skills_status = "loading";
    },
    [addSkills.fulfilled]: (state, action) => {
      state.add_skills_status = "succeeded";
      state.profile = action.payload;
    },
    [addSkills.rejected]: (state, action) => {
      state.add_skills_status = "failed";
      state.add_skills_errors = action.payload;
    },
    [addInterests.pending]: (state, action) => {
      state.add_interests_status = "loading";
    },
    [addInterests.fulfilled]: (state, action) => {
      state.add_interests_status = "succeeded";
      state.profile = action.payload;
    },
    [addInterests.rejected]: (state, action) => {
      state.add_interests_status = "failed";
      state.add_interests_errors = action.payload;
    },
    [addSocialLinks.pending]: (state, action) => {
      state.add_social_links_status = "loading";
    },
    [addSocialLinks.fulfilled]: (state, action) => {
      state.add_social_links_status = "succeeded";
      state.profile = action.payload;
    },
    [addSocialLinks.rejected]: (state, action) => {
      state.add_social_links_status = "failed";
      state.add_social_links_errors = action.payload;
    },
    [addGitHubUsername.pending]: (state, action) => {
      state.add_github_username_status = "loading";
    },
    [addGitHubUsername.fulfilled]: (state, action) => {
      state.add_github_username_status = "succeeded";
      state.profile = action.payload;
    },
    [addGitHubUsername.rejected]: (state, action) => {
      state.add_github_username_status = "failed";
      state.add_github_username_errors = action.payload;
    },
  },
});

export const {
  clearErrors,
  clearAddExperienceErrors,
  clearEditExperienceErrors,
  clearDeleteExperienceErrors,
  clearAddEducationErrors,
  clearEditEducationErrors,
  clearDeleteEducationErrors,
  clearEditGeneralInformationErrors,
  clearEditProfilePictureErrors,
  clearEditCoverImageErrors,
  clearAddAboutErrors,
  clearAddSkillsErrors,
  clearAddInterestsErrors,
  clearAddSocialLinksErrors,
  clearAddGitHubUsernameErrors,
} = profileSlice.actions;

export default profileSlice.reducer;
