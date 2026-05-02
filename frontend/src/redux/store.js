import { configureStore } from "@reduxjs/toolkit";
import songReducer from "./features/songSlice";

export const store = configureStore({
  reducer: {
    songs: songReducer,
  },

  // 🔥 optional but useful for timer/debugging
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // allow timer-related non-serializable values if you ever store interval IDs
        ignoredActions: [],
        ignoredPaths: ["songs.timerInterval"],
      },
    }),
});

export default store;