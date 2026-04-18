// frontend/src/services/tradingService.js
import api from './api';

const tradingService = {
  // Execute / Place a trade
  executeTrade: async (tradeData) => {
    const response = await api.post('/trading/execute', tradeData);
    return response.data;
  },

  // Get active positions for a specific account
  getOpenPositions: async (accountId) => {
    const response = await api.get(`/trading/positions?accountId=${accountId}`);
    return response.data;
  },

  // Close an active position
  closePosition: async (positionId, exitPrice) => {
    const response = await api.post(`/trading/positions/${positionId}/close`, { exitPrice });
    return response.data;
  },

  // Price Alerts
  getAlerts: async () => {
    const response = await api.get('/trading/alerts');
    return response.data;
  },
  createAlert: async (alertData) => {
    const response = await api.post('/trading/alerts', alertData);
    return response.data;
  },
  deleteAlert: async (id) => {
    const response = await api.delete(`/trading/alerts/${id}`);
    return response.data;
  }
};

export default tradingService;
