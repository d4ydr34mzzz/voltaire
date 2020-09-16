import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./components/auth/authSlice.js";

export default configureStore({
  reducer: {
    auth: authReducer,
  },
});
