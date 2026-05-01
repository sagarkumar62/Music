import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import './Profile.scss'

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
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

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
            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to load profile')
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [])

    const handleToggleSettings = () => {
        setShowSettings((state) => !state)
    }

    const handleToggleEdit = () => {
        setIsEditing(true)
        setShowSettings(false)
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
                {
                    withCredentials: true,
                }
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

    const handleLogout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/logout`,
                {},
                { withCredentials: true }
            )
        } catch (err) {
            console.warn('Logout failed', err)
        } finally {
            navigate('/login')
        }
    }

    return (
        <section className="profile-section">
            <div className="profile-header">
                <div>
                    <h1>Profile</h1>
                    <p>View your account details and manage your profile.</p>
                </div>
                <button
                    type="button"
                    className="settings-button"
                    onClick={handleToggleSettings}
                    aria-label="Open settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8.94-2.5a9.04 9.04 0 0 0-.12-1.3l2.07-1.6a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.44 1a8 8 0 0 0-1.78-1.03l-.37-2.6A.5.5 0 0 0 13.13 2h-4a.5.5 0 0 0-.5.42l-.37 2.6a8 8 0 0 0-1.78 1.03l-2.44-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.07 1.6c-.08.42-.13.86-.13 1.3s.05.88.13 1.3L2.5 14.1a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.44-1a8.03 8.03 0 0 0 1.78 1.03l.37 2.6a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.37-2.6a8.03 8.03 0 0 0 1.78-1.03l2.44 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.07-1.6c.08-.42.13-.86.13-1.3Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>

            {showSettings && (
                <div className="profile-settings">
                    <button className="settings-action" onClick={handleToggleEdit}>
                        Edit Profile
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}

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

            <div className="profile-card">
                {loading && <p className="profile-status">Loading profile...</p>}
                {error && <p className="profile-status error">{error}</p>}
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
                                <span className="value">{user?.username || 'Not available'}</span>
                            </div>
                            <div className="profile-row">
                                <span className="label">User ID</span>
                                <span className="value">{user?.id || 'Unknown'}</span>
                            </div>
                            <div className="profile-row">
                                <span className="label">Total songs</span>
                                <span className="value">{songCount}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}

export default Profile
