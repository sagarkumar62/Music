import React, { useEffect, useRef, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentSong,
  selectIsPlaying,
  togglePlayPause,
  nextSong,
  previousSong,
} from "../redux/features/songSlice";
import "./NowPlaying.css";

const NowPlaying = () => {
  const dispatch = useDispatch();
  const currentSong = useSelector(selectCurrentSong);
  const isPlaying = useSelector(selectIsPlaying);
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleSongEnd = useCallback(() => {
    dispatch(nextSong());
  }, [dispatch]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    const audio = audioRef.current;
    if (audio.src !== currentSong.audio) {
      audio.src = currentSong.audio;
      audio.load();
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("ended", handleSongEnd);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    isPlaying ? audio.play().catch(() => {}) : audio.pause();

    return () => {
      audio.removeEventListener("ended", handleSongEnd);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [currentSong, isPlaying, handleSongEnd]);

  if (!currentSong) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="floating-player">
      <audio ref={audioRef} />
      
      <div className="player-main-row">
        <div className="player-left">
          <div className="player-icon-box">
             <svg viewBox="0 0 24 24" fill="#1DB954" width="24" height="24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
             </svg>
          </div>
          <div className="player-text">
            <div className="player-title">{currentSong.title}</div>
            <div className="player-artist">{currentSong.artist}</div>
          </div>
        </div>

        <div className="player-controls">
          <button onClick={() => dispatch(previousSong())} className="p-ctrl">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>
          </button>
          <button onClick={() => dispatch(togglePlayPause())} className="p-play">
            {isPlaying ? 
              <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : 
              <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>
            }
          </button>
          <button onClick={() => dispatch(nextSong())} className="p-ctrl">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>
      </div>

      <div className="player-progress-section">
        <span className="p-time">{formatTime(currentTime)}</span>
        <div className="p-slider-bg">
          <div className="p-slider-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="p-time">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default NowPlaying;