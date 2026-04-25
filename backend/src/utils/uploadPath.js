const path = require('path');

const UPLOADS_PREFIX = '/uploads';

const normalizeStoredUploadPath = (value) => {
    if (!value) {
        return null;
    }

    const raw = String(value).trim();
    if (!raw) {
        return null;
    }

    const normalized = raw.replace(/\\/g, '/');
    const lower = normalized.toLowerCase();
    const uploadsIndex = lower.lastIndexOf('/uploads/');

    if (uploadsIndex !== -1) {
        return normalized.slice(uploadsIndex).replace(/\/{2,}/g, '/');
    }

    const baseName = path.posix.basename(normalized);
    if (!baseName || baseName === '.' || baseName === '/') {
        return null;
    }

    return `${UPLOADS_PREFIX}/${baseName}`;
};

const getUploadPathFromFile = (file) => {
    if (!file) {
        return null;
    }

    if (file.filename) {
        return `${UPLOADS_PREFIX}/${file.filename}`;
    }

    return normalizeStoredUploadPath(file.path);
};

module.exports = {
    UPLOADS_PREFIX,
    normalizeStoredUploadPath,
    getUploadPathFromFile
};
