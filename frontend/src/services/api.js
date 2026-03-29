import axios from 'axios';

let apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Dynamically route to local network IP instead of localhost phone loopback when testing on mobile devices
if (apiBaseUrl.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  apiBaseUrl = apiBaseUrl.replace('localhost', window.location.hostname);
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
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

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed, or handle in context
    }
    return Promise.reject(error);
  }
);

export default api;
