import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Home.css";
import Navigation from "../components/Navigation";
import {
  setCurrentSong,
  selectSongs,
  setSongs,
  resetSongState,
} from "../redux/features/songSlice";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const songs = useSelector(selectSongs);

  const handlePlaySong = (song) => {
    dispatch(setCurrentSong(song));
  };

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
    if (!existing.find((s) => s.audio === song.audio)) {
      existing.push({ ...song });
      localStorage.setItem("offlineSongs", JSON.stringify(existing));
    }
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/songs/get-songs`, {
          withCredentials: true,
        });
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
      <header className="app-header">
        <h1 className="app-logo">Stream</h1>
        <div className="header-actions">
          <Link to="/search" className="icon-btn">🔍</Link>
          <div className="profile-avatar">
            <img src="https://via.placeholder.com/40" alt="Profile" />
          </div>
        </div>
      </header>

      <div className="hero-greeting">
        <h2>Good Morning</h2>
        <p>Ready for your daily rhythm?</p>
      </div>

      <div className="section-header">
        <h3 className="trending-title">Trending</h3>
        <button className="see-all-btn">SEE ALL</button>
      </div>

      <div className="trending-list">
        {songs.map((song) => (
          <div key={song._id} className="trending-card" onClick={() => handlePlaySong(song)}>
            <div className="card-left">
              <div className="music-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                   <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <div className="song-info">
                <span className="song-name">{song.title}</span>
                <span className="artist-name">{song.artist}</span>
              </div>
            </div>
            <button 
              className="download-icon-btn" 
              onClick={(e) => { e.stopPropagation(); cacheSong(song); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <Navigation />
    </section>
  );
};

export default Home;