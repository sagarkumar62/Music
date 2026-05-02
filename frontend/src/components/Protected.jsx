import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Protected = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
            withCredentials: true
        })
        .then(response => {
            console.log(response.data)
        })
        .catch(() => {
            navigate("/login")
        })
    }, [])

    return children
}

export default Protected