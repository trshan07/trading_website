// frontend/src/services/tradingService.js
import api from './api';

const tradingService = {
  previewTrade: async (tradeData) => {
    const response = await api.post('/trading/preview', tradeData);
    return response.data;
  },

  // Execute / Place a trade
  executeTrade: async (tradeData) => {
    const response = await api.post('/trading/execute', tradeData);
    return response.data;
  },

  // Get active positions for a specific account
  getOpenOrders: async (accountId) => {
    const response = await api.get(`/trading/orders?accountId=${accountId}`);
    return response.data;
  },

  getOpenPositions: async (accountId) => {
    const response = await api.get(`/trading/positions?accountId=${accountId}`);
    return response.data;
  },

  getClosedPositions: async (accountId) => {
    const response = await api.get(`/trading/positions/history?accountId=${accountId}`);
    return response.data;
  },

  getRiskSnapshot: async (accountId) => {
    const response = await api.get(`/trading/risk?accountId=${accountId}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.delete(`/trading/orders/${orderId}`);
    return response.data;
  },

  updateOrder: async (orderId, orderData) => {
    const response = await api.patch(`/trading/orders/${orderId}`, orderData);
    return response.data;
  },

  updatePosition: async (positionId, positionData) => {
    const response = await api.patch(`/trading/positions/${positionId}`, positionData);
    return response.data;
  },

  // Close an active position
  closePosition: async (positionId, exitPrice, quantity = null) => {
    const response = await api.post(`/trading/positions/${positionId}/close`, { exitPrice, quantity });
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
