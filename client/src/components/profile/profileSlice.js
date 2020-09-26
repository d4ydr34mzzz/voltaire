import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  profile: null,
  profiles: null,
  fetch_current_users_profile_status: "idle",
  initialize_user_profile_status: "idle",
  add_experience_status: "idle",
  add_experience_errors: {},
  add_education_status: "idle",
  add_education_errors: {},
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
    clearAddEducationErrors: (state) => {
      state.add_education_errors = {};
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
  },
});

export const {
  clearErrors,
  clearAddExperienceErrors,
  clearAddEducationErrors,
} = profileSlice.actions;

export default profileSlice.reducer;
