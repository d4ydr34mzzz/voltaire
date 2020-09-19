import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import authReducer from "./components/auth/authSlice.js";

const appReducer = combineReducers({
  auth: authReducer,
});

// Reference: https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store/51831112
const rootReducer = (state, action) => {
  if (action.type === "auth/logoutUser/fulfilled") {
    storage.removeItem("persist:root");
    state = undefined;
  }

  return appReducer(state, action);
};

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

let persistor = persistStore(store);

export { store, persistor };
