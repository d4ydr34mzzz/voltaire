import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  profile: null,
  profiles: null,
  fetch_current_users_profile_status: "idle",
  initialize_user_profile_status: "idle",
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

export const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = {};
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
  },
});

export const { clearErrors } = profileSlice.actions;

export default profileSlice.reducer;
