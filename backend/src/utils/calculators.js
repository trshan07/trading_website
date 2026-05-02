const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF', 'SGD', 'TRY'];

const DEFAULT_CONTRACT_SIZES = {
    forex: 100000,
    crypto: 1,
    stocks: 1,
    funds: 1,
    commodities: 100,
    futures: 1,
    indices: 1,
    bonds: 1000,
    economy: 1000,
    options: 100,
};

const DEFAULT_QUANTITY_LABELS = {
    forex: 'units',
    crypto: 'coins',
    stocks: 'shares',
    funds: 'shares',
    commodities: 'units',
    futures: 'contracts',
    indices: 'index units',
    bonds: 'contracts',
    economy: 'contracts',
    options: 'contracts',
};

const DEFAULT_LOT_STEP = {
    forex: 0.01,
    crypto: 0.001,
    stocks: 0.01,
    funds: 0.01,
    commodities: 0.01,
    futures: 0.01,
    indices: 0.01,
    bonds: 0.01,
    economy: 0.01,
    options: 0.01,
};

const DEFAULT_MIN_LOT = {
    ...DEFAULT_LOT_STEP,
};

const DEFAULT_MOVEMENT_LABELS = {
    forex: 'Pips',
    commodities: 'Points',
    futures: 'Points',
    indices: 'Points',
    bonds: 'Points',
    economy: 'Points',
    options: 'Points',
    stocks: 'Price Move',
    funds: 'Price Move',
    crypto: 'Price Move',
};

const DEFAULT_MOVEMENT_VALUE_LABELS = {
    forex: 'Pip Value',
    commodities: 'Point Value',
    futures: 'Point Value',
    indices: 'Point Value',
    bonds: 'Point Value',
    economy: 'Point Value',
    options: 'Point Value',
    stocks: 'Price Move Value',
    funds: 'Price Move Value',
    crypto: 'Price Move Value',
};

const SYMBOL_RULE_OVERRIDES = {
    XAUUSD: {
        pointSize: 0.01,
        movementLabel: 'Points',
        movementValueLabel: 'Point Value',
        quantityLabel: 'oz',
        calculationMode: 'commodity-usd',
    },
    XAGUSD: {
        pointSize: 0.001,
        movementLabel: 'Points',
        movementValueLabel: 'Point Value',
        quantityLabel: 'oz',
        calculationMode: 'commodity-usd',
    },
    BRENT: {
        pointSize: 0.001,
        movementLabel: 'Points',
        movementValueLabel: 'Point Value',
        calculationMode: 'commodity-usd',
    },
    WTI: {
        pointSize: 0.001,
        movementLabel: 'Points',
        movementValueLabel: 'Point Value',
        calculationMode: 'commodity-usd',
    },
    'CL1!': {
        pointSize: 0.001,
        movementLabel: 'Points',
        movementValueLabel: 'Point Value',
        calculationMode: 'futures-usd',
    },
};

const normalizeSymbol = (symbol = '') => String(symbol).toUpperCase().replace(/[^A-Z0-9!]/g, '');

const isForexPair = (symbol = '') => {
    if (symbol.length !== 6) {
        return false;
    }

    const base = symbol.slice(0, 3);
    const quote = symbol.slice(3, 6);
    return FOREX_CODES.includes(base) && FOREX_CODES.includes(quote);
};

const resolveCategoryKey = (category = '', symbol = '') => {
    const cat = String(category || '').toLowerCase();
    const normalizedSymbol = normalizeSymbol(symbol);

    if (cat.includes('forex') || isForexPair(normalizedSymbol)) return 'forex';
    if (cat.includes('crypto') || normalizedSymbol.endsWith('USDT')) return 'crypto';
    if (cat.includes('stock') || cat.includes('share')) return 'stocks';
    if (cat.includes('fund') || cat.includes('etf')) return 'funds';
    if (cat.includes('commod') || normalizedSymbol.startsWith('XAU') || normalizedSymbol.startsWith('XAG') || ['WTI', 'BRENT', 'CL1!'].includes(normalizedSymbol)) return 'commodities';
    if (cat.includes('future')) return 'futures';
    if (cat.includes('indice') || cat.includes('index') || cat.includes('brazilian')) return 'indices';
    if (cat.includes('bond')) return 'bonds';
    if (cat.includes('economy')) return 'economy';
    if (cat.includes('option')) return 'options';
    return 'commodities';
};

const inferPrecision = ({ symbol = '', categoryKey = '', instrument = {}, price = 0 }) => {
    if (Number.isInteger(instrument.precision)) {
        return instrument.precision;
    }

    if (categoryKey === 'forex') {
        return normalizeSymbol(symbol).includes('JPY') ? 3 : 5;
    }

    if (price > 0 && price < 1) {
        return 4;
    }

    if (price > 0 && price < 100) {
        return 4;
    }

    return 2;
};

const getMovementSize = ({ symbol = '', categoryKey = '', precision = 2, instrument = {} }) => {
    const override = SYMBOL_RULE_OVERRIDES[normalizeSymbol(symbol)] || {};
    const explicitPointSize = Number.parseFloat(
        override.pointSize
        ?? override.point_size
        ?? instrument.movementSize
        ?? instrument.movement_size
        ?? instrument.pointSize
        ?? instrument.point_size
    );

    if (Number.isFinite(explicitPointSize) && explicitPointSize > 0) {
        return explicitPointSize;
    }

    if (categoryKey === 'forex') {
        return normalizeSymbol(symbol).includes('JPY') ? 0.01 : 0.0001;
    }

    if (['commodities', 'futures', 'indices', 'bonds', 'economy', 'options'].includes(categoryKey)) {
        return 10 ** (-Math.max(0, precision));
    }

    return 1;
};

const getInstrumentTradingMeta = ({ symbol = '', category = '', instrument = {} } = {}) => {
    const normalizedSymbol = normalizeSymbol(symbol || instrument.symbol || '');
    const override = SYMBOL_RULE_OVERRIDES[normalizedSymbol] || {};
    const categoryKey = resolveCategoryKey(instrument.category || category, normalizedSymbol);
    const price = Number.parseFloat(instrument.price ?? instrument.defaultPrice ?? 0) || 0;
    const precision = inferPrecision({
        symbol: normalizedSymbol,
        categoryKey,
        instrument,
        price,
    });

    return {
        categoryKey,
        contractSize: Number.parseFloat(instrument.contractSize ?? DEFAULT_CONTRACT_SIZES[categoryKey]) || 1,
        quantityLabel: instrument.quantityLabel || override.quantityLabel || DEFAULT_QUANTITY_LABELS[categoryKey],
        lotStep: Number.parseFloat(instrument.lotStep ?? DEFAULT_LOT_STEP[categoryKey]) || 0.01,
        minLot: Number.parseFloat(instrument.minLot ?? DEFAULT_MIN_LOT[categoryKey]) || 0.01,
        precision,
        movementLabel: override.movementLabel || DEFAULT_MOVEMENT_LABELS[categoryKey] || 'Price Move',
        movementValueLabel: override.movementValueLabel || DEFAULT_MOVEMENT_VALUE_LABELS[categoryKey] || 'Price Move Value',
        movementSize: getMovementSize({
            symbol: normalizedSymbol,
            categoryKey,
            precision,
            instrument,
        }),
        calculationMode: override.calculationMode || `${categoryKey}-standard`,
        calculationVerified: true,
    };
};

const getForexLegs = (symbol = '') => {
    const normalized = normalizeSymbol(symbol);
    if (!isForexPair(normalized)) {
        return null;
    }

    return {
        base: normalized.slice(0, 3),
        quote: normalized.slice(3, 6),
    };
};

const calculateAccountCurrencyNotional = ({
    symbol = '',
    category = '',
    instrument = {},
    quantity = 0,
    price = 0,
    accountCurrency = 'USD',
}) => {
    const meta = getInstrumentTradingMeta({ symbol, category, instrument });
    const parsedQuantity = Number.parseFloat(quantity) || 0;
    const parsedPrice = Number.parseFloat(price) || 0;
    const normalizedAccountCurrency = String(accountCurrency || 'USD').toUpperCase();

    if (parsedQuantity <= 0) {
        return 0;
    }

    if (meta.categoryKey === 'forex') {
        const legs = getForexLegs(symbol);
        if (legs?.quote === normalizedAccountCurrency) {
            return parsedQuantity * parsedPrice;
        }

        if (legs?.base === normalizedAccountCurrency) {
            return parsedQuantity;
        }
    }

    return parsedQuantity * parsedPrice;
};

const convertQuotePnlToAccountCurrency = ({
    symbol = '',
    category = '',
    instrument = {},
    pnl = 0,
    conversionPrice = 0,
    accountCurrency = 'USD',
}) => {
    const meta = getInstrumentTradingMeta({ symbol, category, instrument });
    const normalizedAccountCurrency = String(accountCurrency || 'USD').toUpperCase();
    const parsedPnl = Number.parseFloat(pnl) || 0;
    const parsedConversionPrice = Number.parseFloat(conversionPrice) || 0;

    if (parsedPnl === 0) {
        return 0;
    }

    if (meta.categoryKey === 'forex') {
        const legs = getForexLegs(symbol);
        if (legs?.quote === normalizedAccountCurrency) {
            return parsedPnl;
        }

        if (legs?.base === normalizedAccountCurrency && parsedConversionPrice > 0) {
            return parsedPnl / parsedConversionPrice;
        }
    }

    return parsedPnl;
};

const calculateQuantityFromLots = (lots, symbol, category, instrument) => {
    const meta = getInstrumentTradingMeta({ symbol, category, instrument });
    return (Number.parseFloat(lots) || 0) * meta.contractSize;
};

const calculateNotionalValue = ({ quantity = 0, price = 0 }) => {
    const parsedQuantity = Number.parseFloat(quantity) || 0;
    const parsedPrice = Number.parseFloat(price) || 0;
    return parsedQuantity * parsedPrice;
};

const calculateMarginRequired = ({
    symbol = '',
    category = '',
    instrument = {},
    quantity = 0,
    lots = null,
    price = 0,
    leverage = 100,
}) => {
    const parsedLeverage = Number.parseFloat(leverage) || 0;
    const resolvedQuantity = Number.isFinite(Number.parseFloat(quantity)) && Number.parseFloat(quantity) > 0
        ? Number.parseFloat(quantity)
        : calculateQuantityFromLots(lots ?? 0, symbol, category, instrument);

    if (!parsedLeverage || resolvedQuantity <= 0) {
        return 0;
    }

    return calculateAccountCurrencyNotional({
        symbol,
        category,
        instrument,
        quantity: resolvedQuantity,
        price,
    }) / parsedLeverage;
};

const calculateProjectedPnl = ({
    symbol = '',
    category = '',
    instrument = {},
    side = 'buy',
    entryPrice = 0,
    exitPrice = 0,
    quantity = 0,
    lots = null,
}) => {
    const parsedEntry = Number.parseFloat(entryPrice) || 0;
    const parsedExit = Number.parseFloat(exitPrice) || 0;
    const resolvedQuantity = Number.isFinite(Number.parseFloat(quantity)) && Number.parseFloat(quantity) > 0
        ? Number.parseFloat(quantity)
        : calculateQuantityFromLots(lots ?? 0, symbol, category, instrument);

    if (!parsedEntry || !parsedExit || !resolvedQuantity) {
        return 0;
    }

    const rawPnl = String(side).toLowerCase() === 'sell'
        ? (parsedEntry - parsedExit) * resolvedQuantity
        : (parsedExit - parsedEntry) * resolvedQuantity;

    return convertQuotePnlToAccountCurrency({
        symbol,
        category,
        instrument,
        pnl: rawPnl,
        conversionPrice: parsedExit || parsedEntry,
    });
};

const calculateMovementValue = ({
    symbol = '',
    category = '',
    instrument = {},
    entryPrice = 0,
    exitPrice = 0,
}) => {
    const meta = getInstrumentTradingMeta({ symbol, category, instrument });
    const parsedEntry = Number.parseFloat(entryPrice) || 0;
    const parsedExit = Number.parseFloat(exitPrice) || 0;

    if (!parsedEntry || !parsedExit || !meta.movementSize) {
        return 0;
    }

    return Math.abs(parsedExit - parsedEntry) / meta.movementSize;
};

const calculatePipValue = ({
    symbol = '',
    category = '',
    instrument = {},
    lots = null,
    quantity = 0,
    price = 0,
}) => {
    const meta = getInstrumentTradingMeta({ symbol, category, instrument });
    const referencePrice = Number.parseFloat(price) || Number.parseFloat(instrument.price) || 1;
    const resolvedQuantity = Number.isFinite(Number.parseFloat(quantity)) && Number.parseFloat(quantity) > 0
        ? Number.parseFloat(quantity)
        : calculateQuantityFromLots(lots ?? 1, symbol, category, instrument);

    if (!resolvedQuantity || !meta.movementSize) {
        return 0;
    }

    return calculateProjectedPnl({
        symbol,
        category,
        instrument,
        side: 'buy',
        entryPrice: referencePrice,
        exitPrice: referencePrice + meta.movementSize,
        quantity: resolvedQuantity,
    });
};

module.exports = {
    normalizeSymbol,
    isForexPair,
    resolveCategoryKey,
    getInstrumentTradingMeta,
    calculateQuantityFromLots,
    calculateNotionalValue,
    calculateMarginRequired,
    calculateProjectedPnl,
    calculateMovementValue,
    calculatePipValue,
};
