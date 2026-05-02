import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCurrentSong } from "../redux/features/songSlice";

const OfflineSongs = () => {
  const [songs, setSongs] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadCachedSongs = async () => {
      const cache = await caches.open("music-cache");
      const requests = await cache.keys();

      // 🔥 localStorage metadata
      const savedSongs =
        JSON.parse(localStorage.getItem("offlineSongs")) || [];

      const songList = requests.map((req, index) => {
        // match using audio URL
        const match = savedSongs.find(
          (s) => s.audio === req.url
        );

        return {
          _id: index,
          title: match?.title || req.url.split("/").pop(),
          artist: match?.artist || "Offline",
          poster: match?.poster || "/default.png",
          audio: req.url, // cache URL
        };
      });

      setSongs(songList);
    };

    loadCachedSongs();
  }, []);

  const handlePlay = (song) => {
    dispatch(setCurrentSong(song)); // ✅ global player
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Offline Songs</h2>

      {songs.length === 0 && <p>No cached songs</p>}

      {songs.map((song) => (
        <div
          key={song._id}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
          onClick={() => handlePlay(song)}
        >
          <img src={song.poster} width="50" />
          <div>
            <div>{song.title}</div>
            <div>{song.artist}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfflineSongs;