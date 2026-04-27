import api from './api';

const infraService = {
  // Instruments & Categories
  getInstruments: async () => {
    const response = await api.get('/infra/instruments');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/infra/instruments/categories');
    return response.data;
  },

  getMarketHistory: async (symbol, interval, initialPrice = 100) => {
    const response = await api.get('/infra/market-data/history', {
      params: { symbol, interval, initialPrice }
    });
    return response.data;
  },

  getMarketQuotes: async (symbols = []) => {
    const response = await api.get('/infra/market-data/quotes', {
      params: { symbols: symbols.join(',') }
    });
    return response.data;
  },

  getOrderBook: async (symbol, levels = 15) => {
    const response = await api.get('/infra/market-data/order-book', {
      params: { symbol, levels }
    });
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/infra/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.put(`/infra/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await api.put('/infra/notifications/mark-all-read');
    return response.data;
  },

  // Activity Logs
  getActivityLogs: async () => {
    const response = await api.get('/infra/activity/logs');
    return response.data;
  },

  // Favorites (Watchlist)
  getFavorites: async () => {
    const response = await api.get('/infra/favorites');
    return response.data; // Array of symbols
  },

  toggleFavorite: async (symbol) => {
    const response = await api.post('/infra/favorites/toggle', { symbol });
    return response.data;
  }
};

export default infraService;
