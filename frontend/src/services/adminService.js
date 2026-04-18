// frontend/src/services/adminService.js
import api from './api';

export const adminService = {
  // Dashboard
  getDashboardStats: (params) => api.get('/admin/stats', { params }),
  
  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  createAdmin: (data) => api.post('/admin/users/admin', data),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateUserStatus: (userId, status) => api.patch(`/admin/users/${userId}/status`, { status }),
  adjustUserBalance: (userId, data) => api.post(`/admin/users/${userId}/balance`, data),
  
  // Funding Requests
  getFundingRequests: (params) => api.get('/admin/funding', { params }),
  processFundingRequest: (requestId, status, reason = null) => api.post(`/admin/funding/${requestId}/process`, { status, reason }),
  exportFundingRequests: (status) => api.get('/admin/funding/export', { params: { status }, responseType: 'blob' }),
  
  // Trade Oversight
  getTrades: (params) => api.get('/admin/trades', { params }),
  getTradeStats: () => api.get('/admin/trades/stats'),
  cancelTrade: (tradeId) => api.post(`/admin/trades/${tradeId}/cancel`),
  
  // KYC Management
  getKYCSubmissions: (params) => api.get('/admin/kyc', { params }),
  processKYC: (submissionId, status, reason = null) => api.post(`/admin/kyc/${submissionId}/process`, { status, reason }),
  
  // Transactions
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getTransactionStats: () => api.get('/admin/transactions/stats'),
  exportTransactions: (params) => api.get('/admin/transactions/export', { params, responseType: 'blob' }),
  
  // Reports
  generateReport: (params) => api.get('/admin/reports', { params, responseType: 'blob' }),
  getReportList: () => api.get('/admin/reports/list'),
  
  // System Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  
  // Audit Logs
  getAuditLogs: (params) => api.get('/admin/logs', { params }),
  exportAuditLogs: (params) => api.get('/admin/logs/export', { params, responseType: 'blob' }),
};