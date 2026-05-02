import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentSong,
  selectIsPlaying,
  togglePlayPause,
  nextSong,
  selectSleepTimer,
} from "../redux/features/songSlice";

const NowPlaying = () => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);

  const song = useSelector(selectCurrentSong);
  const isPlaying = useSelector(selectIsPlaying);
  const sleepTimer = useSelector(selectSleepTimer);

  const [time, setTime] = useState(0);

  // 🎵 audio control
  useEffect(() => {
    if (!audioRef.current || !song?.audio) return;

    const audio = audioRef.current;

    if (audio.src !== song.audio) {
      audio.src = song.audio;
      audio.load();
      setTime(0);
    }

    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [song, isPlaying]);

  // 💤 STOP MUSIC WHEN TIMER ENDS
  useEffect(() => {
    if (!sleepTimer.active && sleepTimer.remaining === 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      dispatch(togglePlayPause());
    }
  }, [sleepTimer.remaining]);

  if (!song?._id) return null;

  return (
    <div className="now-playing">
      <audio ref={audioRef} />

      <div>
        <h4>{song.title}</h4>
        <p>{song.artist}</p>
      </div>

      <button onClick={() => dispatch(nextSong())}>Next</button>
    </div>
  );
};

export default NowPlaying;