import React, { useEffect, useRef, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentSong,
  selectIsPlaying,
  togglePlayPause,
  nextSong,
  previousSong,
  selectSleepTimer,
  stopSleepTimer,
} from "../redux/features/songSlice";
import "./NowPlaying.css";

const NowPlaying = ({
  currentSong: songProp,
  isPlaying: isPlayingProp,
  togglePlayPause: togglePlayPauseProp,
}) => {
  const dispatch = useDispatch();
  const reduxCurrentSong = useSelector(selectCurrentSong);
  const reduxIsPlaying = useSelector(selectIsPlaying);
  const sleepTimer = useSelector(selectSleepTimer);

  const audioRef = useRef(null);

  const currentSong = songProp || reduxCurrentSong;
  const isPlaying =
    isPlayingProp !== undefined ? isPlayingProp : reduxIsPlaying;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 🎧 auto next song
  const handleSongEnd = useCallback(() => {
    dispatch(nextSong());
  }, [dispatch]);

  // ⏱ format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 🎵 audio engine
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const songUrl = currentSong?.audio;

    if (songUrl && audio.src !== songUrl) {
      audio.src = songUrl;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("ended", handleSongEnd);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener("ended", handleSongEnd);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [currentSong?.audio, isPlaying, handleSongEnd]);

  // 🔁 seek
  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // ▶️ play/pause
  const handleTogglePlayPause = () => {
    if (togglePlayPauseProp) togglePlayPauseProp();
    else dispatch(togglePlayPause());
  };

  // 💤 TIMER EFFECT (IMPORTANT PART)
  useEffect(() => {
    if (!sleepTimer?.active) return;

    if (sleepTimer.remaining <= 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      dispatch(togglePlayPause());
      dispatch(stopSleepTimer());
    }
  }, [sleepTimer?.remaining, sleepTimer?.active, dispatch]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
    <div className="now-playing">
      <audio ref={audioRef} preload="auto" style={{ display: "none" }} />

      <img
        src={currentSong.poster}
        alt={currentSong.title}
        className="now-playing-image"
      />

      <div className="now-playing-details">
        <div className="now-playing-title">{currentSong.title}</div>
        <div className="now-playing-artist">{currentSong.artist}</div>

        {/* progress */}
        <div className="progress-container">
          <span className="time-display">{formatTime(currentTime)}</span>

          <input
            type="range"
            className="progress-slider"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              background: `linear-gradient(to right, #000 ${progress}%, #ddd ${progress}%)`,
            }}
          />

          <span className="time-display">{formatTime(duration)}</span>
        </div>

        {/* 💤 optional timer status (no controls here) */}
        {sleepTimer?.active && (
          <div className="timer-status">
            ⏱ Auto-stop in: {sleepTimer.remaining} sec
          </div>
        )}
      </div>

      {/* controls */}
      <div className="now-playing-controls">
        <button
          className="control-button"
          onClick={() => dispatch(previousSong())}
        >
          ⏮
        </button>

        <button className="play-button" onClick={handleTogglePlayPause}>
          {isPlaying ? "⏸" : "▶️"}
        </button>

        <button
          className="control-button"
          onClick={() => dispatch(nextSong())}
        >
          ⏭
        </button>
      </div>
    </div>
  );
};

export default NowPlaying;