const firstArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    for (const item of Object.values(value)) {
        if (Array.isArray(item)) return item;
    }
    return [];
};

const valueOf = (source, names, fallback = null) => {
    for (const name of names) {
        if (source?.[name] !== undefined && source[name] !== null) return source[name];
    }
    return fallback;
};

const mapTrade = (item, account) => ({
    id: String(valueOf(item, ['TicketID', 'TicketId', 'OrderID', 'OrderId', 'ID'])),
    vertexfx_order_id: String(valueOf(item, ['TicketID', 'TicketId', 'OrderID', 'OrderId', 'ID'])),
    account_id: account.id,
    symbol: valueOf(item, ['Symbol', 'SymbolName', 'SymbolCode'], ''),
    side: Number(valueOf(item, ['BuySell', 'Type'], 0)) === 1 ? 'sell' : 'buy',
    quantity: Number(valueOf(item, ['Lots', 'lots', 'Amount'], 0)),
    amount: Number(valueOf(item, ['Lots', 'lots', 'Amount'], 0)),
    entry_price: Number(valueOf(item, ['OpenPrice', 'Price', 'OrderPrice'], 0)),
    current_price: Number(valueOf(item, ['CurrentPrice', 'ClosePrice', 'Price'], 0)),
    stop_loss: valueOf(item, ['SL', 'StopLoss']),
    take_profit: valueOf(item, ['TP', 'TakeProfit']),
    pnl: Number(valueOf(item, ['PL', 'ProfitLoss', 'Profit'], 0)),
    opened_at: valueOf(item, ['OpenTime', 'OpenDate', 'Date']),
    closed_at: valueOf(item, ['CloseTime', 'CloseDate']),
    raw: item,
});

const mapTrades = (response, account) => firstArray(response).map((item) => mapTrade(item, account));

module.exports = { firstArray, valueOf, mapTrade, mapTrades };
