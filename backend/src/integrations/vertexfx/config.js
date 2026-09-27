const normalizeBaseUrl = (value, fallback) => String(value || fallback).replace(/\/+$/, '');

const mode = String(process.env.VERTEXFX_MODE || 'disabled').trim().toLowerCase();

const config = {
    mode,
    enabled: mode === 'authoritative',
    clientUrl: normalizeBaseUrl(process.env.VERTEXFX_CLIENT_URL, 'https://trade.tiktrades.com/Client.svc'),
    backofficeUrl: normalizeBaseUrl(process.env.VERTEXFX_BACKOFFICE_URL, 'https://trade.tiktrades.com/Backoffice.svc'),
    clientUsername: process.env.VERTEXFX_CLIENT_USERNAME || '',
    clientPassword: process.env.VERTEXFX_CLIENT_PASSWORD || '',
    backofficeUsername: process.env.VERTEXFX_BACKOFFICE_USERNAME || '',
    backofficePassword: process.env.VERTEXFX_BACKOFFICE_PASSWORD || '',
    backofficeLoginPath: process.env.VERTEXFX_BACKOFFICE_LOGIN_PATH || 'BackofficeLogin',
    backofficeLoginMethod: String(process.env.VERTEXFX_BACKOFFICE_LOGIN_METHOD || 'GET').toUpperCase(),
    parentId: process.env.VERTEXFX_PARENT_ID || '',
    realAccountType: process.env.VERTEXFX_REAL_ACCOUNT_TYPE || '',
    demoAccountType: process.env.VERTEXFX_DEMO_ACCOUNT_TYPE || '',
    timeoutMs: Number.parseInt(process.env.VERTEXFX_REQUEST_TIMEOUT_MS || '30000', 10),
};

const validateConfiguration = () => {
    if (!config.enabled) return;

    const missing = [];
    if (!config.clientUsername) missing.push('VERTEXFX_CLIENT_USERNAME');
    if (!config.clientPassword) missing.push('VERTEXFX_CLIENT_PASSWORD');
    if (!config.backofficeUsername) missing.push('VERTEXFX_BACKOFFICE_USERNAME');
    if (!config.backofficePassword) missing.push('VERTEXFX_BACKOFFICE_PASSWORD');
    if (!config.parentId) missing.push('VERTEXFX_PARENT_ID');
    if (!config.realAccountType) missing.push('VERTEXFX_REAL_ACCOUNT_TYPE');
    if (!config.demoAccountType) missing.push('VERTEXFX_DEMO_ACCOUNT_TYPE');

    if (missing.length) {
        throw new Error(`VertexFX authoritative mode is missing: ${missing.join(', ')}`);
    }
};

module.exports = { config, validateConfiguration };
