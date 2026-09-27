const { config } = require('./config');
const { VertexFxHttpClient } = require('./httpClient');

const client = new VertexFxHttpClient({
    baseUrl: config.clientUrl,
    timeoutMs: config.timeoutMs,
    login: {
        path: 'LoginPost',
        method: 'POST',
        payload: { Username: config.clientUsername, Password: config.clientPassword },
    },
});

const backoffice = new VertexFxHttpClient({
    baseUrl: config.backofficeUrl,
    timeoutMs: config.timeoutMs,
    login: {
        path: config.backofficeLoginPath,
        method: config.backofficeLoginMethod,
        payload: { Username: config.backofficeUsername, Password: config.backofficePassword },
    },
});

const clientService = {
    getAccountSummary: (AccountID) => client.request('GetAccountSummaryPost', { AccountID }),
    getOpenPositions: (AccountId) => client.request('GetOpenPositionsPost', { AccountId }),
    getPendingOrders: (AccountId) => client.request('GetPendingOrdersPost', { AccountId }),
    getHistory: (AccountId, FromDate, ToDate, lastXdays = 30) =>
        client.request('GetHistoryPost', { AccountId, FromDate, ToDate, lastXdays }),
    getAllSymbols: () => client.request('GetAllSymbolsPost', {}),
    newOrder: (payload) => client.request('NewOrderPost', payload),
    newLimitOrder: (payload) => client.request('NewLimitOrderPost', payload),
    cancelLimitOrder: (AccountId, OrderId) => client.request('CancelLimitOrderPost', { AccountId, OrderId }),
    updateLimitOrder: (payload) => client.request('UpdateLimitOrderPost', payload),
    updateSltp: (payload) => client.request('UpdateSLTPOrderPost', payload),
    closeOrder: (AccountId, Lots, TicketId) => client.request('CloseOrderPost', { AccountId, Lots, TicketId }),
};

const backofficeService = {
    createClient: (payload) => backoffice.request('CreateClientPost', payload),
    createAccount: (payload) => backoffice.request('CreateAccountPost', payload),
    moneyTransaction: (payload) => backoffice.request('MoneyTransactionsPost', payload),
    getAccountSummary: (AccountId) => backoffice.request('GetAccountSummaryPost', { AccountId }),
};

module.exports = { clientService, backofficeService };
