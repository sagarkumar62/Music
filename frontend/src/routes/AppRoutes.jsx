import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Upload from '../pages/Upload'
import Register from '../pages/Register'
import Search from '../pages/Search'
import Profile from '../pages/Profile'
import Protected from '../components/Protected'
import MainLayout from '../components/MainLayout'
import OfflineSongs from '../pages/OfflineSongs.jsx'


const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Protected><MainLayout /></Protected>}>
                    <Route index element={<Home />} />
                    <Route path='search' element={<Search />} />
                    <Route path='profile' element={<Profile />} />
                    <Route path='upload' element={<Upload />} />
                    <Route path='/offline' element={<OfflineSongs />} />
                </Route>
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes