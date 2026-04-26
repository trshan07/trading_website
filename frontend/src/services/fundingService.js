import api from './api';

const fundingService = {
  // Bank Accounts
  getBankAccounts: async () => {
    const response = await api.get('/funding/bank-accounts');
    return response.data;
  },
  addBankAccount: async (accountData) => {
    if (accountData.proofOfBankAccount) {
      const formData = new FormData();
      Object.keys(accountData).forEach(key => {
        formData.append(key, accountData[key]);
      });
      const response = await api.post('/funding/bank-accounts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
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
    console.log('fundingService.addCreditCard called with:', cardData);
    try {
      const response = await api.post('/funding/credit-cards', cardData);
      console.log('fundingService.addCreditCard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('fundingService.addCreditCard error:', error);
      throw error;
    }
  },
  deleteCreditCard: async (id) => {
    const response = await api.delete(`/funding/credit-cards/${id}`);
    return response.data;
  },
  setDefaultCreditCard: async (id) => {
    const response = await api.patch(`/funding/credit-cards/${id}/default`);
    return response.data;
  },

  // Transactions
  getTransactions: async () => {
    const response = await api.get('/funding/transactions');
    return response.data;
  },
  deposit: async (depositData) => {
    // Check if we need to send as FormData (if file is present)
    if (depositData.proof) {
      const formData = new FormData();
      Object.keys(depositData).forEach(key => {
        if (key === 'proof') {
          formData.append('proof', depositData[key]);
        } else {
          formData.append(key, depositData[key]);
        }
      });
      const response = await api.post('/funding/deposit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await api.post('/funding/deposit', depositData);
    return response.data;
  },
  getPlatformInfo: async () => {
    const response = await api.get('/funding/platform-info');
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
