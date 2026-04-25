import axios from 'axios';

// Vite uses import.meta.env — process.env does NOT work in Vite
let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Dynamically route to local network IP instead of localhost phone loopback
// when testing on mobile devices
if (
  apiBaseUrl.includes('localhost') &&
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost'
) {
  apiBaseUrl = apiBaseUrl.replace('localhost', window.location.hostname);
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('trading_mode');

      if (hadToken) {
        console.warn('[AUTH] Session expired - dispatching logout event');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;