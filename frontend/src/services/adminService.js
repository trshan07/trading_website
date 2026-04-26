// frontend/src/services/adminService.js
import api from './api';
import { getUploadUrl } from '../utils/uploadUrl';

const enrichResponse = (response, extra = {}) => Object.assign(response, extra);

const normalizeUser = (user) => ({
  ...user,
  id: user?.id != null ? String(user.id) : user?.id,
  name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Unknown User',
  status: user?.status || (user?.is_active === false ? 'suspended' : 'active'),
});

const normalizeFundingRequest = (request) => ({
  ...request,
  id: request?.id != null ? String(request.id) : request?.id,
  userEmail: request?.userEmail || request?.user_email || '',
  createdAt: request?.createdAt || request?.created || request?.created_at,
  updatedAt: request?.updatedAt || request?.updated_at || request?.createdAt || request?.created,
  rejectionReason: request?.rejectionReason || request?.rejection_reason || request?.note || '',
  proofImage: getUploadUrl(request?.proofImage || request?.proof),
});

const normalizeTrade = (trade) => ({
  ...trade,
  id: trade?.id != null ? String(trade.id) : trade?.id,
  userEmail: trade?.userEmail || trade?.user_email || '',
  pair: trade?.pair || trade?.symbol,
  type: String(trade?.type || '').toLowerCase(),
  createdAt: trade?.createdAt || trade?.opened || trade?.created_at,
  updatedAt: trade?.updatedAt || trade?.updated_at || trade?.createdAt,
});

const normalizeTransaction = (transaction) => ({
  ...transaction,
  id: transaction?.id != null ? String(transaction.id) : transaction?.id,
  userEmail: transaction?.userEmail || transaction?.user_email || '',
  createdAt: transaction?.createdAt || transaction?.created_at,
  updatedAt: transaction?.updatedAt || transaction?.updated_at || transaction?.createdAt,
  reference: transaction?.reference != null ? String(transaction.reference) : transaction?.reference,
});

const filterBySearch = (items, search, fields) => {
  if (!search) return items;
  const needle = String(search).toLowerCase();

  return items.filter((item) =>
    fields.some((field) => String(item?.[field] || '').toLowerCase().includes(needle))
  );
};

const paginateItems = (items, page = 1, limit = 10) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 10, 1);
  const start = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    total: items.length,
    items: items.slice(start, start + safeLimit),
  };
};

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const exportBlob = async (request, filename) => {
  const response = await request;
  triggerDownload(response.data, filename);
  return response;
};

export const adminService = {
  getDashboardStats: async (params) => {
    const response = await api.get('/admin/stats', { params });
    return enrichResponse(response, response.data?.data || {});
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    const normalized = (response.data?.data || []).map(normalizeUser);
    const searched = filterBySearch(normalized, params.search, ['name', 'email']);
    const paged = paginateItems(searched, params.page, params.limit);

    response.data.data = normalized;
    return enrichResponse(response, {
      users: paged.items,
      total: paged.total,
      page: paged.page,
      limit: paged.limit,
    });
  },

  createUser: (data) => api.post('/admin/users', data),
  createAdmin: (data) => api.post('/admin/users/admin', data),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateUserStatus: (userId, status) => api.patch(`/admin/users/${userId}/status`, { status }),
  adjustUserBalance: (userId, data) => api.post(`/admin/users/${userId}/balance`, data),
  resetUserPassword: (userId, password) => api.post(`/admin/users/${userId}/reset-password`, { password }),

  getFundingRequests: async (params = {}) => {
    const response = await api.get('/admin/funding', { params });
    const normalized = (response.data?.data || []).map(normalizeFundingRequest);
    const paged = paginateItems(normalized, params.page, params.limit);

    response.data.data = normalized;
    return enrichResponse(response, {
      requests: paged.items,
      total: paged.total,
      page: paged.page,
      limit: paged.limit,
    });
  },

  processFundingRequest: (requestId, status, reason = null, accountId = null) =>
    api.post(`/admin/funding/${requestId}/process`, { status, reason, accountId }),
  approveFundingRequest: (requestId) =>
    adminService.processFundingRequest(requestId, 'approved'),
  rejectFundingRequest: (requestId, reason) =>
    adminService.processFundingRequest(requestId, 'rejected', reason),
  exportFundingRequests: (status = 'all') =>
    exportBlob(
      api.get('/admin/funding/export', { params: { status }, responseType: 'blob' }),
      `funding-requests-${status}.csv`
    ),

  getTrades: async (params = {}) => {
    const response = await api.get('/admin/trades', { params });
    let normalized = (response.data?.data || []).map(normalizeTrade);

    if (params.type && params.type !== 'all') {
      normalized = normalized.filter((trade) => trade.type === String(params.type).toLowerCase());
    }
    if (params.search) {
      normalized = filterBySearch(normalized, params.search, ['id', 'userName', 'userEmail', 'pair']);
    }

    const paged = paginateItems(normalized, params.page, params.limit);
    response.data.data = normalized;

    return enrichResponse(response, {
      trades: paged.items,
      total: paged.total,
      page: paged.page,
      limit: paged.limit,
    });
  },

  getTradeStats: async () => {
    const response = await api.get('/admin/trades/stats');
    return enrichResponse(response, response.data?.data || {});
  },

  cancelTrade: (tradeId) => api.post(`/admin/trades/${tradeId}/cancel`),

  getPlatformSettings: () => api.get('/admin/settings'),
  updatePlatformSettings: (settings) => api.put('/admin/settings', settings),
  getGrowthStats: async () => {
    const response = await api.get('/admin/growth-stats');
    return enrichResponse(response, response.data?.data || {});
  },

  getKYCSubmissions: async (params) => {
    const response = await api.get('/admin/kyc', { params });
    return enrichResponse(response, {
      submissions: response.data?.data || [],
    });
  },

  processKYC: (submissionId, status, reason = null) =>
    api.post(`/admin/kyc/${submissionId}/process`, { status, reason }),

  getTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    let normalized = (response.data?.data || []).map(normalizeTransaction);

    if (params.type && params.type !== 'all') {
      normalized = normalized.filter((transaction) => transaction.type === params.type);
    }
    if (params.status && params.status !== 'all') {
      normalized = normalized.filter((transaction) => transaction.status === params.status);
    }
    if (params.search) {
      normalized = filterBySearch(normalized, params.search, ['id', 'userName', 'userEmail', 'reference']);
    }

    const paged = paginateItems(normalized, params.page, params.limit);
    response.data.data = normalized;

    return enrichResponse(response, {
      transactions: paged.items,
      total: paged.total,
      page: paged.page,
      limit: paged.limit,
    });
  },

  getTransactionStats: async () => {
    const response = await api.get('/admin/transactions/stats');
    return enrichResponse(response, response.data?.data || {});
  },

  exportTransactions: (params = {}) =>
    exportBlob(
      api.get('/admin/transactions/export', { params, responseType: 'blob' }),
      'transactions.csv'
    ),

  generateReport: async (params = {}) => {
    const statsResponse = await api.get('/admin/stats');
    const report = {
      generatedAt: new Date().toISOString(),
      params,
      stats: statsResponse.data?.data || {},
    };

    triggerDownload(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
      'admin-report.json'
    );

    return enrichResponse(statsResponse, { report });
  },

  getReportList: async () =>
    ({
      data: { success: true, data: [] },
      reports: [],
    }),

  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),

  getAuditLogs: async (params) => {
    const response = await api.get('/admin/logs', { params });
    return enrichResponse(response, {
      logs: response.data?.data || [],
    });
  },

  exportAuditLogs: (params = {}) =>
    exportBlob(
      api.get('/admin/logs/export', { params, responseType: 'blob' }),
      'admin-logs.csv'
    ),
};
