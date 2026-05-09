const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

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
