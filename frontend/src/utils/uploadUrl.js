const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const API_ORIGIN = API_URL.replace(/\/api$/i, '');

export const getUploadUrl = (filePath) => {
  if (!filePath) return null;

  const rawValue = String(filePath);
  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) return rawValue;

  const normalized = rawValue.replace(/\\/g, '/');
  const normalizedWithoutOrigin = normalized.replace(/^https?:\/\/[^/]+/i, '');
  const normalizedWithoutApi = normalizedWithoutOrigin.replace(/^\/api(?=\/)/i, '');
  const uploadsIdx = normalizedWithoutApi.indexOf('/uploads/');

  if (uploadsIdx !== -1) {
    return `${API_URL}${normalizedWithoutApi.substring(uploadsIdx)}`;
  }

  if (!normalizedWithoutApi.startsWith('/')) {
    return `${API_URL}/uploads/${normalizedWithoutApi}`;
  }

  return normalizedWithoutOrigin.startsWith('/api/')
    ? `${API_ORIGIN}${normalizedWithoutOrigin}`
    : `${API_URL}${normalizedWithoutApi}`;
};

export const isPdfFile = (filePath) => String(filePath || '').toLowerCase().endsWith('.pdf');
