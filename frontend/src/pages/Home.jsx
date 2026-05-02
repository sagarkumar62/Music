import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentSong,
  selectSongs,
  setSongs,
  resetSongState,
  startSleepTimer,
  stopSleepTimer,
  selectSleepTimer,
} from "../redux/features/songSlice";
import axios from "axios";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

const Home = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectSongs);
  const sleepTimer = useSelector(selectSleepTimer);

  const [minutes, setMinutes] = useState("");

  const handlePlaySong = (song) => {
    dispatch(setCurrentSong(song));
  };

  const handleStartTimer = () => {
    const m = Number(minutes);
    if (!m || m <= 0) return;

    dispatch(startSleepTimer(m));
    setMinutes("");
  };

  const handleStopTimer = () => {
    dispatch(stopSleepTimer());
  };

  useEffect(() => {
    const fetchSongs = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/songs/get-songs`,
        { withCredentials: true }
      );

      dispatch(resetSongState());
      dispatch(setSongs(res.data.songs));
    };

    fetchSongs();
  }, [dispatch]);

  return (
    <section className="home-section">
      <div className="app-header">
        <h1>Stream</h1>
        <Link to="/search">🔍</Link>
      </div>

      {/* 💤 TIMER UI (ONLY HERE) */}
      <div className="sleep-timer-box">
        <input
          type="number"
          placeholder="Minutes (e.g. 30)"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />

        <button onClick={handleStartTimer}>Start</button>

        {sleepTimer.active && (
          <>
            <button onClick={handleStopTimer}>Stop</button>
            <p>⏱ Remaining: {sleepTimer.remaining}s</p>
          </>
        )}
      </div>

      {/* SONG LIST */}
      <div className="song-list">
        {songs.map((song) => (
          <div key={song._id} className="song-item">
            <img
              src={song.poster}
              alt={song.title}
              onClick={() => handlePlaySong(song)}
            />
            <div onClick={() => handlePlaySong(song)}>
              {song.title} - {song.artist}
            </div>
          </div>
        ))}
      </div>

      <Navigation />
    </section>
  );
};

export default Home;