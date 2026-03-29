// src/utils/axiosConfig.js
import axios from 'axios';

let apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Dynamically route to local network IP instead of localhost phone loopback when testing on mobile devices
if (apiUrl.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  apiUrl = apiUrl.replace('localhost', window.location.hostname);
}

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;