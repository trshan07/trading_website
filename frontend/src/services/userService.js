// frontend/src/services/userService.js
import api from './api';

const normalizeSettings = (settings = {}) => ({
    theme: settings.theme || 'dark',
    chartPreferences: settings.chartPreferences || settings.chart_preferences || {},
    notificationSettings: settings.notificationSettings || settings.notification_settings || {},
});

const serializeSettings = (settings = {}) => ({
    theme: settings.theme || 'dark',
    chartPreferences: settings.chartPreferences || settings.chart_preferences || {},
    notificationSettings: settings.notificationSettings || settings.notification_settings || {},
});

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
    },

    /**
     * Get user dashboard settings
     */
    getSettings: async () => {
        const response = await api.get('/users/settings');
        return {
            ...response.data,
            data: normalizeSettings(response.data?.data),
        };
    },

    /**
     * Update user settings
     * @param {Object} settingsData - { theme, chartPreferences, notificationSettings }
     */
    updateSettings: async (settingsData) => {
        const response = await api.put('/users/settings', serializeSettings(settingsData));
        return {
            ...response.data,
            data: normalizeSettings(response.data?.data),
        };
    }
};

export default userService;
