// frontend/src/services/kycService.js
import api from './api';

const kycService = {
  getDocuments: async () => {
    const response = await api.get('/kyc/documents');
    return response.data;
  },
  
  uploadDocument: async (formData) => {
    const response = await api.post('/kyc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteDocument: async (id) => {
    const response = await api.delete(`/kyc/documents/${id}`);
    return response.data;
  }
};

export default kycService;
