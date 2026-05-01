import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentSong, selectIsPlaying, togglePlayPause, nextSong, previousSong } from '../redux/features/songSlice';
import './NowPlaying.css';

const NowPlaying = ({ currentSong: songProp, isPlaying: isPlayingProp, togglePlayPause: togglePlayPauseProp }) => {
    const dispatch = useDispatch();
    const reduxCurrentSong = useSelector(selectCurrentSong);
    const reduxIsPlaying = useSelector(selectIsPlaying);
    const audioRef = useRef(null);

    const currentSong = songProp || reduxCurrentSong;
    const isPlaying = isPlayingProp !== undefined ? isPlayingProp : reduxIsPlaying;

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handleSongEnd = useCallback(() => {
        dispatch(nextSong());
    }, [dispatch]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;

        if (currentSong?.audio && audio.src !== currentSong.audio) {
            audio.src = currentSong.audio;
            audio.load();
            setCurrentTime(0);
            setDuration(0);
        }

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);

        audio.addEventListener('ended', handleSongEnd);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        if (isPlaying) {
            audio.play().catch(() => {});
        } else {
            audio.pause();
        }

        return () => {
            audio.removeEventListener('ended', handleSongEnd);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [currentSong?.audio, isPlaying, handleSongEnd]);

    const handleSeek = (e) => {
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleTogglePlayPause = () => {
        if (togglePlayPauseProp) togglePlayPauseProp();
        else dispatch(togglePlayPause());
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="now-playing">
            <audio ref={audioRef} preload="auto" style={{ display: 'none' }} />
            <img src={currentSong.poster} alt={currentSong.title} className="now-playing-image" />
            <div className="now-playing-details">
                <div className="now-playing-title">{currentSong.title}</div>
                <div className="now-playing-artist">{currentSong.artist}</div>
                {/* Progress slider row */}
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
                            background: `linear-gradient(to right, #000 ${progress}%, #ddd ${progress}%)`
                        }}
                    />
                    <span className="time-display">{formatTime(duration)}</span>
                </div>
            </div>
            <div className="now-playing-controls">
                <button className="control-button" onClick={() => dispatch(previousSong())}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="19 20 9 12 19 4 19 20"></polygon>
                        <line x1="5" y1="19" x2="5" y2="5"></line>
                    </svg>
                </button>
                <button className="play-button" onClick={handleTogglePlayPause}>
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    )}
                </button>
                <button className="control-button" onClick={() => dispatch(nextSong())}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 4 15 12 5 20 5 4"></polygon>
                        <line x1="19" y1="5" x2="19" y2="19"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default NowPlaying;