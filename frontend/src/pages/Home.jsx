import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Home.css";
import Navigation from "../components/Navigation";
import {
  setCurrentSong,
  togglePlayPause,
  selectSongs,
  selectCurrentSong,
  selectIsPlaying,
  setSongs,
  resetSongState,
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

        // 🔥 IMPORTANT: reset player when new session loads
        dispatch(resetSongState());

        dispatch(setSongs(response.data.songs));
      } catch (err) {
        console.error(err);
      }
    };

    fetchSongs();
  }, [dispatch]);

  return (
    <section className="home-section">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">Stream</h1>

        <Link to="/search" className="search-icon">
          🔍
        </Link>
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