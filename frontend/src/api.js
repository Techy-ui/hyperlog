import axios from 'axios';

// Centralized configuration pointing to your Node backend
const API = axios.create({
    baseURL: 'https://hyperlog-jjsu.onrender.com/api'
});

// Automatically intercept every request and inject the auth token if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;