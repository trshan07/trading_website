const WEEKDAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const CRYPTO_SYMBOLS = new Set([
  'BTCUSD',
  'BTCUSDT',
  'ETHUSD',
  'ETHUSDT',
  'XRPUSD',
  'BNBUSDT',
  'SOLUSD',
  'SOLUSDT',
  'ADAUSD',
  'ADAUSDT',
]);

const FOREX_CATEGORIES = new Set(['FOREX']);
const CRYPTO_CATEGORIES = new Set(['CRYPTO']);
const WEEKEND_CLOSED_CATEGORIES = new Set([
  'STOCKS',
  'FUNDS',
  'OPTIONS',
  'ECONOMY',
  'BRAZILIAN INDEX',
]);

const SUNDAY_1700_ET_SYMBOLS = new Set([
  'US500',
  'NAS100',
  'US30',
  'JP225',
  'SPX',
  'NDX',
  'DJI',
  'ES1!',
  'YM1!',
  'US10Y',
]);

const SUNDAY_1800_ET_SYMBOLS = new Set([
  'WTI',
  'NATGAS',
  'XAUUSD',
  'XAGUSD',
  'CL1!',
]);

const SUNDAY_2000_ET_SYMBOLS = new Set([
  'BRENT',
]);

const normalizeValue = (value = '') => String(value || '').trim().toUpperCase();

const getZonedParts = (date = new Date(), timeZone = 'UTC') => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value || 'Sun';
  const hour = Number.parseInt(parts.find((part) => part.type === 'hour')?.value || '0', 10);
  const minute = Number.parseInt(parts.find((part) => part.type === 'minute')?.value || '0', 10);

  return {
    day: WEEKDAY_INDEX[weekday] ?? 0,
    hour,
    minute,
  };
};

const isAfterOrAt = (parts, hour, minute = 0) => (
  parts.hour > hour || (parts.hour === hour && parts.minute >= minute)
);

const isBefore = (parts, hour, minute = 0) => (
  parts.hour < hour || (parts.hour === hour && parts.minute < minute)
);

export const isCryptoMarket = ({ symbol = '', category = '' } = {}) => (
  CRYPTO_CATEGORIES.has(normalizeValue(category)) || CRYPTO_SYMBOLS.has(normalizeValue(symbol))
);

export const isForexMarket = ({ category = '' } = {}) => FOREX_CATEGORIES.has(normalizeValue(category));

const getWeekendStateByEtOpen = ({ now, openHourEt, openMinuteEt = 0, reason }) => {
  const et = getZonedParts(now, 'America/New_York');

  if (et.day === 6) {
    return {
      isOpen: false,
      reason,
      code: 'weekend_closed',
      session: 'closed_weekend',
    };
  }

  if (et.day === 0 && isBefore(et, openHourEt, openMinuteEt)) {
    return {
      isOpen: false,
      reason,
      code: 'weekend_closed',
      session: 'closed_until_sunday_evening_et',
    };
  }

  return {
    isOpen: true,
    reason: 'Market is open.',
    code: 'open',
    session: 'open',
  };
};

export const getMarketSessionState = ({ symbol = '', category = '', now = new Date() } = {}) => {
  const normalizedSymbol = normalizeValue(symbol);
  const normalizedCategory = normalizeValue(category);

  if (isCryptoMarket({ symbol: normalizedSymbol, category: normalizedCategory })) {
    return {
      isOpen: true,
      reason: 'Crypto markets trade 24/7, including weekends.',
      code: 'crypto_247',
      session: 'always_open',
      category: normalizedCategory,
      symbol: normalizedSymbol,
    };
  }

  if (isForexMarket({ category: normalizedCategory })) {
    return {
      ...getWeekendStateByEtOpen({
        now,
        openHourEt: 17,
        openMinuteEt: 5,
        reason: 'Forex is closed over the weekend and reopens Sunday at 5:05 PM New York time.',
      }),
      category: normalizedCategory,
      symbol: normalizedSymbol,
    };
  }

  if (SUNDAY_1700_ET_SYMBOLS.has(normalizedSymbol)) {
    return {
      ...getWeekendStateByEtOpen({
        now,
        openHourEt: 17,
        reason: 'This market is closed on Saturday and reopens Sunday at 5:00 PM New York time.',
      }),
      category: normalizedCategory,
      symbol: normalizedSymbol,
    };
  }

  if (SUNDAY_1800_ET_SYMBOLS.has(normalizedSymbol)) {
    return {
      ...getWeekendStateByEtOpen({
        now,
        openHourEt: 18,
        reason: 'This market is closed on Saturday and reopens Sunday at 6:00 PM New York time.',
      }),
      category: normalizedCategory,
      symbol: normalizedSymbol,
    };
  }

  if (SUNDAY_2000_ET_SYMBOLS.has(normalizedSymbol)) {
    return {
      ...getWeekendStateByEtOpen({
        now,
        openHourEt: 20,
        reason: 'This market is closed on Saturday and reopens Sunday at 8:00 PM New York time.',
      }),
      category: normalizedCategory,
      symbol: normalizedSymbol,
    };
  }

  if (WEEKEND_CLOSED_CATEGORIES.has(normalizedCategory) || ['UK100', 'DE40', 'VIX', 'DXY', 'IBOV'].includes(normalizedSymbol)) {
    const et = getZonedParts(now, 'America/New_York');
    const weekendClosed = et.day === 6 || et.day === 0;

    return {
      isOpen: !weekendClosed,
      reason: weekendClosed
        ? 'This market is closed on Saturday and Sunday.'
        : 'Market is open.',
      code: weekendClosed ? 'weekend_closed' : 'open',
      session: weekendClosed ? 'closed_weekend' : 'open',
      category: normalizedCategory,
      symbol: normalizedSymbol,
    };
  }

  const et = getZonedParts(now, 'America/New_York');
  const weekendClosed = et.day === 6 || et.day === 0;

  return {
    isOpen: !weekendClosed,
    reason: weekendClosed
      ? 'This market is closed on Saturday and Sunday.'
      : 'Market is open.',
    code: weekendClosed ? 'weekend_closed' : 'open',
    session: weekendClosed ? 'closed_weekend' : 'open',
    category: normalizedCategory,
    symbol: normalizedSymbol,
  };
};
