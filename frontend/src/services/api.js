import axios from 'axios';

const raw = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api';

   export const apiBaseUrl =
     raw.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost'
       ? raw.replace('localhost', window.location.hostname)
       : raw;

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
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('trading_mode');
      // Only fire the event if there WAS a token (i.e. this is a real expiry, not a pre-login request)
      if (hadToken) {
        console.warn('[AUTH] Session expired - dispatching logout event');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
