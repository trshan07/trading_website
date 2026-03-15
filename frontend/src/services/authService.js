import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, newPassword });
    return response.data;
  },

  demoLogin: async () => {
    const response = await api.post('/auth/demo-login');
    return response.data;
  },
};

export default authService;
