import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Profile.scss'
import { useDispatch } from 'react-redux'
import { resetSongState } from '../redux/features/songSlice'


const Profile = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showSettings, setShowSettings] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')
    const [pictureFile, setPictureFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [songCount, setSongCount] = useState(0)
    const [offlineCount, setOfflineCount] = useState(0)
    const [saving, setSaving] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch();


    // 📡 Fetch Profile + Songs
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileResponse, songsResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                        withCredentials: true,
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL}/songs/get-songs`, {
                        withCredentials: true,
                    }),
                ])

                const fetchedUser = profileResponse.data.user
                setUser(fetchedUser)
                setUsernameInput(fetchedUser.username || '')
                setPreviewUrl(fetchedUser.profilePicture || '')
                setSongCount(songsResponse.data.songs?.length || 0)

                // ✅ Load offline songs count
                const offlineSongs = JSON.parse(localStorage.getItem("offlineSongs")) || []
                setOfflineCount(offlineSongs.length)

            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to load profile')
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [])

    // ⚙️ Settings Toggle
    const handleToggleSettings = () => {
        setShowSettings((state) => !state)
    }

    const handleToggleEdit = () => {
        setIsEditing(true)
        setShowSettings(false)
    }

    // 🎧 Navigate to Offline Songs
    const handleOfflineSongs = () => {
        navigate('/offline')
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setPictureFile(null)
        if (user) {
            setUsernameInput(user.username || '')
            setPreviewUrl(user.profilePicture || '')
        }
    }

    const handlePictureChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            setPictureFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    // 💾 Save Profile
    const handleSaveProfile = async () => {
        if (!usernameInput.trim()) {
            setError('Username cannot be empty')
            return
        }

        setSaving(true)
        const formData = new FormData()
        formData.append('username', usernameInput.trim())

        if (pictureFile) {
            formData.append('picture', pictureFile)
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/update-profile`,
                formData,
                { withCredentials: true }
            )

            setUser(response.data.user)
            setPreviewUrl(response.data.user.profilePicture || '')
            setIsEditing(false)
            setPictureFile(null)
            setError(null)
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    // 🚪 Logout
   const handleLogout = async () => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );

    // 🔥 IMPORTANT: clear music state
    dispatch(resetSongState());

  } catch (err) {
    console.warn("Logout failed", err);
  } finally {
    navigate("/login");
  }
};

    return (
        <section className="profile-section">

            {/* Header */}
            <div className="profile-header">
                <div>
                    <h1>Profile</h1>
                    <p>View your account details and manage your profile.</p>
                </div>

                <button
                    type="button"
                    className="settings-button"
                    onClick={handleToggleSettings}
                >
                    ⚙️
                </button>
            </div>

            {/* Settings Menu */}
            {showSettings && (
                <div className="profile-settings">
                    <button className="settings-action" onClick={handleToggleEdit}>
                        Edit Profile
                    </button>

                    {/* ✅ Offline Songs Button */}
                    <button className="settings-action" onClick={handleOfflineSongs}>
                        🎧 Offline Songs
                    </button>

                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}

            {/* Edit Profile */}
            {isEditing && (
                <div className="profile-edit">
                    <div className="edit-avatar">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile preview" />
                        ) : (
                            <div className="avatar-placeholder">
                                {usernameInput?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <label className="upload-label">
                            Change picture
                            <input type="file" accept="image/*" onChange={handlePictureChange} />
                        </label>
                    </div>

                    <div className="profile-row edit-row">
                        <span className="label">Username</span>
                        <input
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="profile-input"
                        />
                    </div>

                    <div className="edit-actions">
                        <button className="save-button" onClick={handleSaveProfile} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="cancel-button" onClick={handleCancelEdit}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Card */}
            <div className="profile-card">
                {loading && <p>Loading profile...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && (
                    <>
                        <div className="profile-avatar profile-avatar-large">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.username} />
                            ) : (
                                <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                            )}
                        </div>

                        <div className="profile-details">
                            <div className="profile-row">
                                <span className="label">Username</span>
                                <span className="value">{user?.username}</span>
                            </div>

                            <div className="profile-row">
                                <span className="label">User ID</span>
                                <span className="value">{user?.id}</span>
                            </div>

                            <div className="profile-row">
                                <span className="label">Total songs</span>
                                <span className="value">{songCount}</span>
                            </div>

                            {/* ✅ Offline Songs Count */}
                            <div className="profile-row">
                                <span className="label">Offline songs</span>
                                <span className="value">{offlineCount}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

        </section>
    )
}

export default Profile