import React, { useEffect, useState } from "react";
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
import { toast } from 'react-toastify';

const Home = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectSongs);
  const currentSong = useSelector(selectCurrentSong);
  const isPlaying = useSelector(selectIsPlaying);

  const [longPressSong, setLongPressSong] = useState(null);
  const [pressTimer, setPressTimer] = useState(null);

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
      toast.success('Song downloaded successfully!');
    } else {
      toast.info('Song already downloaded');
    }
  };

  // �️ Delete Song
  const deleteSong = async (song) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/songs/delete-song/${song._id}`,
        { withCredentials: true }
      );

      // Remove from local state
      const updatedSongs = songs.filter(s => s._id !== song._id);
      dispatch(setSongs(updatedSongs));

      toast.success('Song deleted successfully!');
      setLongPressSong(null);
    } catch (err) {
      toast.error('Failed to delete song');
      console.error(err);
    }
  };

  // �📡 Fetch songs
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

  // Long press handlers
  const handleMouseDown = (song) => {
    const timer = setTimeout(() => {
      setLongPressSong(song);
    }, 500); // 500ms long press
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
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

      {/* 🎵 Songs */}
      <div className="song-list">
        {songs.map((song) => (
          <div 
            key={song._id} 
            className="song-item"
            onMouseDown={() => handleMouseDown(song)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => handleMouseDown(song)}
            onTouchEnd={handleMouseUp}
          >
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

            {longPressSong && longPressSong._id === song._id && (
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSong(song);
                }}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      

      {/* Navigation */}
      <Navigation />
    </section>
  );
};

export default Home;