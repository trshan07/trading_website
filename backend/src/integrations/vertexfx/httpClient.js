const axios = require('axios');

const unwrapWcfResponse = (value) => {
    let result = value;
    if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, 'd')) {
        result = result.d;
    }
    if (typeof result === 'string') {
        const trimmed = result.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try { return JSON.parse(trimmed); } catch (_) { return result; }
        }
    }
    return result;
};

class VertexFxHttpClient {
    constructor({ baseUrl, timeoutMs, login }) {
        this.baseUrl = String(baseUrl).replace(/\/+$/, '');
        this.login = login;
        this.cookie = '';
        this.loginPromise = null;
        this.http = axios.create({
            baseURL: `${this.baseUrl}/`,
            timeout: timeoutMs,
            headers: { Accept: 'application/json', 'Content-Type': 'application/json; charset=utf-8' },
            validateStatus: (status) => status >= 200 && status < 500,
        });
    }

    captureCookie(headers = {}) {
        const values = headers['set-cookie'];
        if (!Array.isArray(values)) return;
        this.cookie = values.map((item) => item.split(';')[0]).join('; ');
    }

    async authenticate(force = false) {
        if (this.cookie && !force) return;
        if (!this.login) throw new Error('VertexFX login is not configured');
        if (!this.loginPromise) {
            this.loginPromise = this.rawRequest(this.login.path, this.login.payload, {
                method: this.login.method,
                skipAuthentication: true,
            }).then((body) => {
                const userId = Number(body?.UserId ?? body?.UserID ?? body?.DealerId ?? body?.ID ?? 0);
                if (userId < 0 || body?.Result === false || body?.Success === false) {
                    throw new Error('VertexFX rejected the configured credentials');
                }
                return body;
            }).finally(() => { this.loginPromise = null; });
        }
        await this.loginPromise;
    }

    async rawRequest(path, payload = {}, options = {}) {
        const method = String(options.method || 'POST').toUpperCase();
        const response = await this.http.request({
            url: String(path).replace(/^\/+/, ''),
            method,
            ...(method === 'GET' ? { params: payload } : { data: payload }),
            headers: this.cookie ? { Cookie: this.cookie } : undefined,
        });
        this.captureCookie(response.headers);
        const body = unwrapWcfResponse(response.data);
        if (response.status >= 400) {
            const error = new Error(body?.Message || body?.message || `VertexFX returned HTTP ${response.status}`);
            error.statusCode = 502;
            error.vertexfxStatus = response.status;
            error.vertexfxBody = body;
            throw error;
        }
        return body;
    }

    async request(path, payload = {}, options = {}) {
        if (!options.skipAuthentication) await this.authenticate();
        try {
            return await this.rawRequest(path, payload, options);
        } catch (error) {
            if (!options.skipAuthentication && [401, 403].includes(error.vertexfxStatus)) {
                this.cookie = '';
                await this.authenticate(true);
                return this.rawRequest(path, payload, options);
            }
            throw error;
        }
    }
}

module.exports = { VertexFxHttpClient, unwrapWcfResponse };
