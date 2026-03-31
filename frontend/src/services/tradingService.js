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
    closePosition: async (tradeId, exitPrice) => {
        const response = await api.put(`/trading/close/${tradeId}`, { exitPrice });
        return response.data;
    }
};

export default tradingService;
