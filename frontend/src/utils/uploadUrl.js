const resolveApiUrl = () => {
  let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  if (
    apiUrl.includes('localhost') &&
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost'
  ) {
    apiUrl = apiUrl.replace('localhost', window.location.hostname);
  }

  if (
    (!apiUrl || apiUrl === 'http://localhost:5000/api') &&
    typeof window !== 'undefined' &&
    window.location?.origin
  ) {
    apiUrl = `${window.location.origin.replace(/\/$/, '')}/api`;
  }

  return apiUrl.replace(/\/$/, '');
};

const API_URL = resolveApiUrl();

const buildResolvedUploadUrl = (filePath, download = false) => {
  if (!filePath) return null;

  const rawValue = String(filePath);
  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) return rawValue;

  const normalized = rawValue.replace(/\\/g, '/');
  const params = new URLSearchParams({ path: normalized });

  if (download) {
    params.set('download', '1');
  }

  return `${API_URL}/uploads/resolve?${params.toString()}`;
};

export const getUploadUrl = (filePath) => {
  return buildResolvedUploadUrl(filePath, false);
};

export const getUploadDownloadUrl = (filePath) => buildResolvedUploadUrl(filePath, true);

export const isPdfFile = (filePath) => String(filePath || '').toLowerCase().endsWith('.pdf');
