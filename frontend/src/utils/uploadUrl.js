const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getUploadUrl = (filePath) => {
  if (!filePath) return null;

  const rawValue = String(filePath);
  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) return rawValue;

  const normalized = rawValue.replace(/\\/g, '/');
  const uploadsIdx = normalized.indexOf('/uploads/');

  if (uploadsIdx !== -1) {
    return `${API_URL}${normalized.substring(uploadsIdx)}`;
  }

  return `${API_URL}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
};

export const isPdfFile = (filePath) => String(filePath || '').toLowerCase().endsWith('.pdf');
