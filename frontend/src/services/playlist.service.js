import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const playlistService = {
  // Create a new playlist
  createPlaylist: async (name) => {
    const response = await axios.post(`${API_URL}/playlists/create`, { name }, {
      withCredentials: true
    });
    return response.data;
  },

  // Get user's playlists
  getUserPlaylists: async () => {
    const response = await axios.get(`${API_URL}/playlists/user-playlists`, {
      withCredentials: true
    });
    return response.data;
  },

  // Add song to playlist
  addSongToPlaylist: async (playlistId, songId) => {
    const response = await axios.post(`${API_URL}/playlists/${playlistId}/add-song/${songId}`, {}, {
      withCredentials: true
    });
    return response.data;
  },

  // Remove song from playlist
  removeSongFromPlaylist: async (playlistId, songId) => {
    const response = await axios.delete(`${API_URL}/playlists/${playlistId}/remove-song/${songId}`, {
      withCredentials: true
    });
    return response.data;
  },

  // Delete playlist
  deletePlaylist: async (playlistId) => {
    const response = await axios.delete(`${API_URL}/playlists/${playlistId}`, {
      withCredentials: true
    });
    return response.data;
  }
};