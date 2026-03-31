// frontend/src/services/userService.js
import api from './api';

const userService = {
    /**
     * Get the current user's profile
     */
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    /**
     * Update the user's personal information
     * @param {Object} userData - { firstName, lastName, phone, country }
     */
    updateProfile: async (userData) => {
        const response = await api.put('/users/profile', userData);
        return response.data;
    },

    /**
     * Change the user's password
     * @param {Object} passwordData - { currentPassword, newPassword }
     */
    changePassword: async (passwordData) => {
        const response = await api.put('/users/change-password', passwordData);
        return response.data;
    }
};

export default userService;
