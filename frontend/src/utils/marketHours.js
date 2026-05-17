const BTC_SYMBOL_PREFIXES = ['BTCUSD', 'BTCUSDT'];

const normalizeValue = (value = '') => String(value || '').trim().toUpperCase();

export const isBtcMarket = (symbol = '') => {
  const normalizedSymbol = normalizeValue(symbol);
  return BTC_SYMBOL_PREFIXES.some((prefix) => normalizedSymbol.startsWith(prefix));
};

export const isWeekendUtc = (date = new Date()) => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

export const getMarketSessionState = ({ symbol = '', category = '', now = new Date() } = {}) => {
  const normalizedCategory = normalizeValue(category);
  const btcMarket = isBtcMarket(symbol);
  const weekend = isWeekendUtc(now);

  if (btcMarket) {
    return {
      isOpen: true,
      reason: 'BTC market stays open on weekends.',
      code: 'btc_always_open',
      isWeekend: weekend,
      isBtcMarket: true,
      category: normalizedCategory,
    };
  }

  if (weekend) {
    return {
      isOpen: false,
      reason: 'Market is closed on Saturday and Sunday. Only BTC stays open on weekends.',
      code: 'weekend_closed',
      isWeekend: true,
      isBtcMarket: false,
      category: normalizedCategory,
    };
  }

  return {
    isOpen: true,
    reason: 'Market is open.',
    code: 'open',
    isWeekend: false,
    isBtcMarket: false,
    category: normalizedCategory,
  };
};
