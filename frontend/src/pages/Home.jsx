import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import NowPlaying from "../components/NowPlaying";
import {
  setCurrentSong, togglePlayPause, selectSongs,
  selectCurrentSong, selectIsPlaying, setSongs, resetSongState,
} from "../redux/features/songSlice";
import "./Home.css";

const WaveformIcon = ({ color = "#1aff7a" }) => (
  <svg width="20" height="16" viewBox="0 0 20 16">
    {[0,3,6,9,12,15,18].map((x, i) => (
      <rect key={x} x={x} y={[8,5,2,6,3,7,10][i]} width="2"
        height={[8,11,14,10,13,9,6][i]} fill={color} rx="1" />
    ))}
  </svg>
);

const PLAYLISTS = [
  { id: 1, name: "Late Night Jazz",  theme: "jazz"  },
  { id: 2, name: "Indie Chill",      theme: "chill" },
  { id: 3, name: "Hologram Pop",     theme: "pop"   },
  { id: 4, name: "Cyber Synth",      theme: "synth" },
];

const RELEASES = [
  { id: 1, title: "Starlight Drift", artist: "Nova Echo",  theme: "starlight" },
  { id: 2, title: "Static Pulse",    artist: "The Glitch", theme: "static"    },
];

const RECENT = [
  { id: 1, title: "Midnight City",    artist: "M83",          color: "#1aff7a" },
  { id: 2, title: "Blue in Green",    artist: "Miles Davis",  color: "#ff6644" },
  { id: 3, title: "Glitch Theory",    artist: "Moderat",      color: "#44aa66" },
  { id: 4, title: "Techno Focus 2024",artist: "Now Playing",  color: "#1aff7a", playing: true },
];

const Home = () => {
  const dispatch    = useDispatch();
  const songs       = useSelector(selectSongs);
  const currentSong = useSelector(selectCurrentSong);
  const isPlaying   = useSelector(selectIsPlaying);

  const handlePlaySong = (song) => dispatch(setCurrentSong(song));

  const cacheSong = async (song) => {
    if (!song.audio) return;
    const cache = await caches.open("music-cache");
    if (!await cache.match(song.audio)) {
      const res = await fetch(song.audio);
      await cache.put(song.audio, res.clone());
    }
    const existing = JSON.parse(localStorage.getItem("offlineSongs")) || [];
    if (!existing.find((s) => s.audio === song.audio)) {
      existing.push({ title: song.title, artist: song.artist,
                      poster: song.poster, audio: song.audio });
      localStorage.setItem("offlineSongs", JSON.stringify(existing));
    }
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/songs/get-songs`,
          { withCredentials: true }
        );
        dispatch(resetSongState());
        dispatch(setSongs(data.songs));
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
        <h1 className="app-title">Melody</h1>
        <div className="header-actions">
          <Link to="/search" className="icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
          <div className="avatar">JD</div>
        </div>
      </div>

      {/* Greeting */}
      <div className="greeting">
        <h2>Good Morning</h2>
        <p>Ready for your daily rhythm?</p>
      </div>

      {/* Featured */}
      <div className="section-header">
        <span className="section-title green-label">Your Playlists</span>
      </div>
      <div className="featured-card">
        <div className="featured-bg" />
        <svg className="waveform" viewBox="0 0 340 120" preserveAspectRatio="none">
          <polyline
            points="0,60 20,45 40,38 60,30 80,25 100,20 120,18 140,15 160,35 180,40 200,45 220,50 240,55 260,58 280,62 300,65 320,68 340,70"
            fill="none" stroke="#1aff7a" strokeWidth="1.5" opacity="0.7" />
          <path
            d="M0,120 L0,60 20,45 40,38 60,30 80,25 100,20 120,18 140,15 160,35 180,40 200,45 220,50 240,55 260,58 280,62 300,65 320,68 340,70 L340,120 Z"
            fill="#1aff7a" opacity="0.08" />
        </svg>
        <div className="trending-badge">Trending</div>
        <div className="featured-info">
          <div className="featured-title">Techno Focus 2024</div>
          <div className="featured-sub">Deep beats for deep work</div>
        </div>
      </div>

      {/* Playlist grid */}
      <div className="playlist-grid">
        {PLAYLISTS.map((pl) => (
          <div key={pl.id} className="playlist-card">
            <div className={`playlist-thumb-bg ${pl.theme}`} />
            <div className="playlist-label">{pl.name}</div>
          </div>
        ))}
      </div>

      {/* New Releases */}
      <div className="section-header">
        <span className="section-title">New Releases</span>
        <button className="see-all">See All</button>
      </div>
      <div className="releases-row">
        {RELEASES.map((r) => (
          <div key={r.id}>
            <div className={`release-card release-thumb ${r.theme}`} />
            <div className="release-info">
              <div className="release-name">{r.title}</div>
              <div className="release-artist">{r.artist}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Played — live songs from API */}
      <div className="section-header">
        <span className="section-title">Recently Played</span>
      </div>
      <div className="recent-list">
        {songs.map((song, i) => {
          const isActive = currentSong?._id === song._id;
          return (
            <div
              key={song._id}
              className={`recent-item ${isActive ? "active" : ""}`}
              onClick={() => handlePlaySong(song)}
            >
              <div className={`recent-thumb t${(i % 4) + 1}`}>
                {song.poster
                  ? <img src={song.poster} alt={song.title} className="recent-poster" />
                  : <WaveformIcon color={isActive ? "#1aff7a" : "#888"} />
                }
              </div>
              <div className="recent-details">
                <div className="recent-title">{song.title}</div>
                <div className={`recent-artist ${isActive ? "playing" : ""}`}>
                  {isActive ? "Now Playing" : song.artist}
                </div>
              </div>
              {isActive ? (
                <button
                  className="recent-action"
                  onClick={(e) => { e.stopPropagation(); dispatch(togglePlayPause()); }}
                >
                  {isPlaying
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#1aff7a">
                        <rect x="6" y="4" width="4" height="16" rx="1"/>
                        <rect x="14" y="4" width="4" height="16" rx="1"/>
                      </svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="#1aff7a">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                  }
                </button>
              ) : (
                <button
                  className="download-btn"
                  onClick={(e) => { e.stopPropagation(); cacheSong(song); }}
                  aria-label="Download for offline"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#555" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Navigation />
    </section>
  );
};

export default Home;