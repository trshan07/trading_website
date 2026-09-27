const Account = require('../../models/Account');
const { config } = require('./config');
const { clientService } = require('./services');
const { firstArray, valueOf, mapTrades } = require('./mapper');

let symbolCache = { expiresAt: 0, items: [] };

const requireExternalAccount = async (accountId, userId) => {
    const account = await Account.findById(accountId);
    if (!account || String(account.user_id) !== String(userId)) {
        const error = new Error('Account not found for this user');
        error.statusCode = 404;
        throw error;
    }
    if (!account.vertexfx_account_id) {
        const error = new Error('This account has not been provisioned in VertexFX');
        error.statusCode = 409;
        throw error;
    }
    return account;
};

const getSymbols = async () => {
    if (symbolCache.expiresAt > Date.now()) return symbolCache.items;
    const response = await clientService.getAllSymbols();
    symbolCache = { items: firstArray(response), expiresAt: Date.now() + 300000 };
    return symbolCache.items;
};

const resolveSymbolId = async (payload) => {
    const explicit = payload.symbolId ?? payload.SymbolID;
    if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit);
    const requested = String(payload.symbol || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
    const match = (await getSymbols()).find((item) => {
        const name = valueOf(item, ['Symbol', 'SymbolName', 'Name', 'Code'], '');
        return String(name).replace(/[^a-z0-9]/gi, '').toUpperCase() === requested;
    });
    const id = valueOf(match, ['SymbolID', 'SymbolId', 'ID', 'Id']);
    if (id === null || id === undefined) {
        const error = new Error(`Symbol ${payload.symbol || ''} is not available in VertexFX`);
        error.statusCode = 400;
        throw error;
    }
    return Number(id);
};

const lotsFromPayload = (payload) => {
    const lots = Number(payload.lots ?? payload.quantity ?? payload.amount);
    if (!Number.isFinite(lots) || lots <= 0) {
        const error = new Error('A positive trade size is required');
        error.statusCode = 400;
        throw error;
    }
    return lots;
};

const placeTrade = async (userId, payload) => {
    const account = await requireExternalAccount(payload.accountId, userId);
    const AccountId = Number(account.vertexfx_account_id);
    const SymbolID = await resolveSymbolId(payload);
    const lots = lotsFromPayload(payload);
    const side = String(payload.side || 'buy').toLowerCase();
    const type = String(payload.type || 'market').toLowerCase();
    const response = type === 'market'
        ? await clientService.newOrder({ AccountId, SymbolID, BuySell: side === 'sell' ? 1 : 0, lots, note: payload.note || '' })
        : await clientService.newLimitOrder({
            AccountId, SymbolID,
            LimitType: Number(payload.limitType ?? (side === 'sell' ? 1 : 0)),
            Price: Number(payload.entryPrice), lots,
            SL: Number(payload.stopLoss || 0), TP: Number(payload.takeProfit || 0), note: payload.note || '',
        });
    return { mode: type === 'market' ? 'market' : 'pending', response };
};

const loadTrades = async (kind, accountId, userId, days = 30) => {
    const account = await requireExternalAccount(accountId, userId);
    const externalId = Number(account.vertexfx_account_id);
    let response;
    if (kind === 'positions') response = await clientService.getOpenPositions(externalId);
    else if (kind === 'orders') response = await clientService.getPendingOrders(externalId);
    else {
        const now = new Date();
        const from = new Date(now.getTime() - days * 86400000);
        response = await clientService.getHistory(externalId, from.toISOString(), now.toISOString(), days);
    }
    return mapTrades(response, account);
};

module.exports = {
    enabled: () => config.enabled,
    placeTrade,
    getOpenPositions: (accountId, userId) => loadTrades('positions', accountId, userId),
    getPendingOrders: (accountId, userId) => loadTrades('orders', accountId, userId),
    getHistory: (accountId, userId, days) => loadTrades('history', accountId, userId, days),
    requireExternalAccount,
    clientService,
};
