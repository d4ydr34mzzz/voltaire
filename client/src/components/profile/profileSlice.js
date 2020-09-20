import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  profile: null,
  profiles: null,
  fetch_current_users_profile_status: "idle",
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
    },
    [fetchCurrentUsersProfile.rejected]: (state, action) => {
      state.fetch_current_users_profile_status = "failed";
      state.errors = action.payload;
      if (state.errors.profile) {
        state.profile = {};
      }
    },
  },
});

export const { clearErrors } = profileSlice.actions;

export default profileSlice.reducer;
