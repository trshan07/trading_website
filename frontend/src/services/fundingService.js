import api from './api';

const fundingService = {
  // Bank Accounts
  getBankAccounts: async () => {
    const response = await api.get('/funding/bank-accounts');
    return response.data;
  },
  addBankAccount: async (accountData) => {
    const response = await api.post('/funding/bank-accounts', accountData);
    return response.data;
  },
  deleteBankAccount: async (id) => {
    const response = await api.delete(`/funding/bank-accounts/${id}`);
    return response.data;
  },
  setDefaultBankAccount: async (id) => {
    const response = await api.patch(`/funding/bank-accounts/${id}/default`);
    return response.data;
  },

  // Credit Cards
  getCreditCards: async () => {
    const response = await api.get('/funding/credit-cards');
    return response.data;
  },
  addCreditCard: async (cardData) => {
    const response = await api.post('/funding/credit-cards', cardData);
    return response.data;
  },
  deleteCreditCard: async (id) => {
    const response = await api.delete(`/funding/credit-cards/${id}`);
    return response.data;
  },

  // Transactions
  getTransactions: async () => {
    const response = await api.get('/funding/transactions');
    return response.data;
  },
  deposit: async (depositData) => {
    const response = await api.post('/funding/deposit', depositData);
    return response.data;
  },
  withdraw: async (withdrawData) => {
    const response = await api.post('/funding/withdraw', withdrawData);
    return response.data;
  },
  transfer: async (transferData) => {
    const response = await api.post('/funding/transfer', transferData);
    return response.data;
  }
};

export default fundingService;
