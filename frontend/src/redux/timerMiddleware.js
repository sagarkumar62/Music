import {
  tickSleepTimer,
  stopSleepTimer,
  togglePlayPause,
} from "./features/songSlice";

let interval = null;

export const timerMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // 🟢 START TIMER
  if (action.type === "songs/startSleepTimer") {
    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      const current = store.getState().songs.sleepTimer;

      if (current.remaining > 0) {
        store.dispatch(tickSleepTimer());
      } else {
        store.dispatch(stopSleepTimer());
        store.dispatch(togglePlayPause());
        clearInterval(interval);
        interval = null;
      }
    }, 1000);
  }

  // 🔴 STOP TIMER
  if (action.type === "songs/stopSleepTimer") {
    if (interval) clearInterval(interval);
    interval = null;
  }

  return result;
};