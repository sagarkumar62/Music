import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Home.css";
import Navigation from "../components/Navigation";
import NowPlaying from "../components/NowPlaying";
import {
  setCurrentSong,
  togglePlayPause,
  selectSongs,
  selectCurrentSong,
  selectIsPlaying,
  setSongs,
} from "../redux/features/songSlice";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectSongs);
  const currentSong = useSelector(selectCurrentSong);
  const isPlaying = useSelector(selectIsPlaying);

  // 🎧 Play Song
  const handlePlaySong = (song) => {
    dispatch(setCurrentSong(song));
  };

  // ⬇️ Download Song for Offline
  const cacheSong = async (song) => {
    const url = song.audio;

    if (!url) return;

    const cache = await caches.open("music-cache");

    const match = await cache.match(url);
    if (!match) {
      const response = await fetch(url);
      await cache.put(url, response.clone());
    }

    // 🔥 metadata save
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

  // 📡 Fetch Songs from Backend
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/songs/get-songs`, {
        withCredentials: true,
      })
      .then((response) => {
        dispatch(setSongs(response.data.songs));
      })
      .catch((err) => console.error(err));
  }, [dispatch]);

  return (
    <section className="home-section">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">Stream</h1>
        <Link to="/search" className="search-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </Link>
      </div>

      {/* 🎵 Song List */}
      <div className="song-list">
        {songs.map((song) => (
          <div key={song._id} className="song-item">
            {/* Click to Play */}
            <img
              src={song.poster}
              alt={song.title}
              className="song-image"
              onClick={() => handlePlaySong(song)}
            />

            <div className="song-details" onClick={() => handlePlaySong(song)}>
              <div className="song-title">{song.title}</div>
              <div className="song-artist">{song.artist}</div>
            </div>

            {/* ⬇️ Download Button */}
            <button
              className="download-btn"
              onClick={(e) => {
                e.stopPropagation();
                cacheSong(song); // ✅ localStorage nahi, cache use
              }}
            >
              ⬇️
            </button>
          </div>
        ))}
      </div>

      {/* 🎧 Now Playing */}

      {/* 🔽 Navigation */}
      <Navigation />
    </section>
  );
};

export default Home;
