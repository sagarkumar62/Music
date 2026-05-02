import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Home.css";
import Navigation from "../components/Navigation";
import NowPlaying from "../components/NowPlaying";
import {
  setCurrentSong,
  selectSongs,
  setSongs,
  resetSongState,
  startSleepTimer,
  stopSleepTimer,
  selectSleepTimer,
} from "../redux/features/songSlice";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectSongs);
  const sleepTimer = useSelector(selectSleepTimer);

  // 💤 local input state
  const [timerMinutes, setTimerMinutes] = useState("");

  // 🎧 Play Song
  const handlePlaySong = (song) => {
    dispatch(setCurrentSong(song));
  };

  // ⬇️ Offline cache
  const cacheSong = async (song) => {
    const url = song.audio;
    if (!url) return;

    const cache = await caches.open("music-cache");

    const match = await cache.match(url);
    if (!match) {
      const response = await fetch(url);
      await cache.put(url, response.clone());
    }

    const existing = JSON.parse(localStorage.getItem("offlineSongs")) || [];

    const already = existing.find((s) => s.audio === song.audio);

    if (!already) {
      existing.push({
        title: song.title,
        artist: song.artist,
        poster: song.poster,
        audio: song.audio,
      });

      localStorage.setItem("offlineSongs", JSON.stringify(existing));
    }
  };

  // 📡 Fetch songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/songs/get-songs`,
          {
            withCredentials: true,
          }
        );

        dispatch(resetSongState());
        dispatch(setSongs(response.data.songs));
      } catch (err) {
        console.error(err);
      }
    };

    fetchSongs();
  }, [dispatch]);

  // 💤 START TIMER
  const handleStartTimer = () => {
    const minutes = Number(timerMinutes);

    if (!minutes || minutes <= 0) return;

    dispatch(startSleepTimer(minutes));
    setTimerMinutes("");
  };

  // 🛑 STOP TIMER
  const handleStopTimer = () => {
    dispatch(stopSleepTimer());
  };

  return (
    <section className="home-section">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">Stream</h1>

        <Link to="/search" className="search-icon">
          🔍
        </Link>
      </div>

      {/* 💤 SLEEP TIMER UI (HOME - YOUR REQUIREMENT) */}
      <div className="sleep-timer-box">
        <input
          type="number"
          placeholder="Enter minutes (e.g. 30)"
          value={timerMinutes}
          onChange={(e) => setTimerMinutes(e.target.value)}
        />

        <button onClick={handleStartTimer}>Start Timer</button>

        {sleepTimer.active && (
          <button onClick={handleStopTimer}>Stop Timer</button>
        )}

        {sleepTimer.active && (
          <p>⏱ Remaining: {sleepTimer.remaining} sec</p>
        )}
      </div>

      {/* 🎵 Songs */}
      <div className="song-list">
        {songs.map((song) => (
          <div key={song._id} className="song-item">
            <img
              src={song.poster}
              alt={song.title}
              className="song-image"
              onClick={() => handlePlaySong(song)}
            />

            <div
              className="song-details"
              onClick={() => handlePlaySong(song)}
            >
              <div className="song-title">{song.title}</div>
              <div className="song-artist">{song.artist}</div>
            </div>

            <button
              className="download-btn"
              onClick={(e) => {
                e.stopPropagation();
                cacheSong(song);
              }}
            >
              ⬇️
            </button>
          </div>
        ))}
      </div>


      {/* Navigation */}
      <Navigation />
    </section>
  );
};

export default Home;