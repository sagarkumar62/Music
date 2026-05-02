import { configureStore } from "@reduxjs/toolkit";
import songReducer from "./features/songSlice";
import { timerMiddleware } from "./timerMiddleware";

export const store = configureStore({
  reducer: {
    songs: songReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(timerMiddleware),
});

export default store;