import { createSlice } from '@reduxjs/toolkit';

// Sample initial music data
const initialState = {
  songs : [],
  currentSong: {
    
  },
  currentSongIndex: 0,
  isPlaying: false,
  filteredSongs: [], // For search functionality
  playlists: [], // User's playlists
  currentPlaylist: null, // Currently playing playlist
  isPlayingPlaylist: false // Whether playing from playlist
};

export const songSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.isPlaying = true;
      // Update index if song is in the list
      const index = state.songs.findIndex(song => song.id === action.payload.id);
      if (index !== -1) {
        state.currentSongIndex = index;
      }
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    nextSong: (state) => {
      if (state.currentPlaylist && state.currentPlaylist.songs.length > 0) {
        // Playing from playlist
        const playlistSongs = state.currentPlaylist.songs;
        const currentIndex = playlistSongs.findIndex(song => song._id === state.currentSong._id);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % playlistSongs.length;
        state.currentSong = playlistSongs[nextIndex];
      } else if (state.songs.length > 0) {
        // Playing from all songs
        state.currentSongIndex = (state.currentSongIndex + 1) % state.songs.length;
        state.currentSong = state.songs[state.currentSongIndex];
      }
      state.isPlaying = true;
    },
    previousSong: (state) => {
      if (state.currentPlaylist && state.currentPlaylist.songs.length > 0) {
        // Playing from playlist
        const playlistSongs = state.currentPlaylist.songs;
        const currentIndex = playlistSongs.findIndex(song => song._id === state.currentSong._id);
        const prevIndex = currentIndex === -1 ? playlistSongs.length - 1 :
                         currentIndex === 0 ? playlistSongs.length - 1 : currentIndex - 1;
        state.currentSong = playlistSongs[prevIndex];
      } else if (state.songs.length > 0) {
        // Playing from all songs
        state.currentSongIndex = state.currentSongIndex === 0 ? state.songs.length - 1 : state.currentSongIndex - 1;
        state.currentSong = state.songs[state.currentSongIndex];
      }
      state.isPlaying = true;
    },
    searchSongs: (state, action) => {
      const query = action.payload.toLowerCase();
      if (query.trim() === '') {
        state.filteredSongs = [];
      } else {
        state.filteredSongs = state.songs.filter(
          song => 
            song.title.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query)
        );
      }
    },
    addSong: (state, action) => {
      state.songs.push(action.payload);
    },
    setSongs : (state, action) => {
      state.songs = action.payload;
    },
    setFilteredSongs: (state, action) => {
      state.filteredSongs = action.payload;
    },
    setPlaylists: (state, action) => {
      state.playlists = action.payload;
    },
    addPlaylist: (state, action) => {
      state.playlists.push(action.payload);
    },
    updatePlaylist: (state, action) => {
      const index = state.playlists.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.playlists[index] = action.payload;
      }
    },
    removePlaylist: (state, action) => {
      state.playlists = state.playlists.filter(p => p._id !== action.payload);
    },
    setCurrentPlaylist: (state, action) => {
      state.currentPlaylist = action.payload;
      state.isPlayingPlaylist = !!action.payload;
    },
    clearCurrentPlaylist: (state) => {
      state.currentPlaylist = null;
      state.isPlayingPlaylist = false;
    }
  },
});

export const { setCurrentSong, togglePlayPause, searchSongs, addSong, setSongs,setFilteredSongs, nextSong, previousSong, setPlaylists, addPlaylist, updatePlaylist, removePlaylist, setCurrentPlaylist, clearCurrentPlaylist } = songSlice.actions;

export const selectSongs = (state) => state.songs.songs;
export const selectCurrentSong = (state) => state.songs.currentSong;
export const selectIsPlaying = (state) => state.songs.isPlaying;
export const selectFilteredSongs = (state) => state.songs.filteredSongs;
export const selectPlaylists = (state) => state.songs.playlists;
export const selectCurrentPlaylist = (state) => state.songs.currentPlaylist;
export const selectIsPlayingPlaylist = (state) => state.songs.isPlayingPlaylist;

export default songSlice.reducer;
