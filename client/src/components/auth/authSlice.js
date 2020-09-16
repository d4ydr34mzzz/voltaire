import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  user: {},
  status: "idle",
  errors: {},
};

// References: https://redux-toolkit.js.org/api/createAsyncThunk
//             https://stackoverflow.com/questions/60802184/using-async-await-with-node-fetch-does-not-return-the-response-to-the-calling-me
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      let response = await axios.post("/api/users/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: {
    [registerUser.pending]: (state, action) => {
      state.status = "loading";
    },
    [registerUser.fulfilled]: (state, action) => {
      state.status = "succeeded";
    },
    [registerUser.rejected]: (state, action) => {
      state.status = "failed";
      state.errors = action.payload;
    },
  },
});

export default authSlice.reducer;
