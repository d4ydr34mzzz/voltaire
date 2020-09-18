import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  user: {},
  register_status: "idle",
  login_status: "idle",
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

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      let response = await axios.post("/api/users/login", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = {};
    },
  },
  extraReducers: {
    [registerUser.pending]: (state, action) => {
      state.register_status = "loading";
    },
    [registerUser.fulfilled]: (state, action) => {
      state.register_status = "succeeded";
    },
    [registerUser.rejected]: (state, action) => {
      state.register_status = "failed";
      state.errors = action.payload;
    },
    [loginUser.pending]: (state, action) => {
      state.login_status = "loading";
    },
    [loginUser.fulfilled]: (state, action) => {
      state.login_status = "succeeded";
      state.user = action.payload;
    },
    [loginUser.rejected]: (state, action) => {
      state.login_status = "failed";
      state.errors = action.payload;
    },
  },
});

export const { clearErrors } = authSlice.actions;

export default authSlice.reducer;
