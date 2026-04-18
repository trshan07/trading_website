// frontend/src/services/publicService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const publicService = {
  getMarkets: async () => {
    try {
      const response = await axios.get(`${API_URL}/public/markets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }
  },

  getMarketsByCategory: async (category) => {
    try {
      const response = await axios.get(`${API_URL}/public/markets/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${category} markets:`, error);
      throw error;
    }
  },

  submitContactForm: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/public/contact`, formData);
      return response.data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  },

  getPromotions: async () => {
    try {
      const response = await axios.get(`${API_URL}/public/promotions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  getAccountTypes: async () => {
    try {
      const response = await axios.get(`${API_URL}/public/account-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching account types:', error);
      throw error;
    }
  }
};

export default publicService;
