import { calculateUsdFromLots, getInstrumentTradingMeta } from './calculators';

const DAY_MS = 24 * 60 * 60 * 1000;

const CATEGORY_FEE_PROFILES = {
  forex: {
    commissionPerLotSide: 3.5,
    swapMode: 'perLot',
    swapLongPerLotDay: -5.0,
    swapShortPerLotDay: 2.0,
  },
  crypto: {
    commissionRate: 0.001,
    commissionMin: 0.5,
    swapMode: 'notional',
    swapLongRate: -0.00025,
    swapShortRate: -0.00025,
  },
  stocks: {
    commissionRate: 0.00025,
    commissionMin: 1,
    swapMode: 'notional',
    swapLongRate: -0.00012,
    swapShortRate: 0.00008,
  },
  commodities: {
    commissionPerLotSide: 4.0,
    swapMode: 'perLot',
    swapLongPerLotDay: -4.5,
    swapShortPerLotDay: 1.75,
  },
  indices: {
    commissionPerLotSide: 2.5,
    swapMode: 'perLot',
    swapLongPerLotDay: -2.5,
    swapShortPerLotDay: 1.0,
  },
  futures: {
    commissionPerLotSide: 2.0,
    swapMode: 'perLot',
    swapLongPerLotDay: -1.5,
    swapShortPerLotDay: -1.5,
  },
  bonds: {
    commissionPerLotSide: 1.5,
    swapMode: 'notional',
    swapLongRate: -0.00008,
    swapShortRate: -0.00008,
  },
  economy: {
    commissionPerLotSide: 1.5,
    swapMode: 'notional',
    swapLongRate: -0.00008,
    swapShortRate: -0.00008,
  },
  options: {
    commissionPerLotSide: 1.5,
    swapMode: 'notional',
    swapLongRate: -0.00015,
    swapShortRate: -0.00015,
  },
};

const SYMBOL_FEE_OVERRIDES = {
  XAUUSD: {
    commissionPerLotSide: 4.5,
    swapMode: 'perLot',
    swapLongPerLotDay: -6.0,
    swapShortPerLotDay: 2.25,
  },
  XAGUSD: {
    commissionPerLotSide: 4.0,
    swapMode: 'perLot',
    swapLongPerLotDay: -5.5,
    swapShortPerLotDay: 2.0,
  },
  WTI: {
    commissionPerLotSide: 4.5,
    swapMode: 'perLot',
    swapLongPerLotDay: -5.0,
    swapShortPerLotDay: 1.5,
  },
  BRENT: {
    commissionPerLotSide: 4.5,
    swapMode: 'perLot',
    swapLongPerLotDay: -5.0,
    swapShortPerLotDay: 1.5,
  },
  NATGAS: {
    commissionPerLotSide: 5.0,
    swapMode: 'perLot',
    swapLongPerLotDay: -6.5,
    swapShortPerLotDay: 2.0,
  },
  NG: {
    commissionPerLotSide: 5.0,
    swapMode: 'perLot',
    swapLongPerLotDay: -6.5,
    swapShortPerLotDay: 2.0,
  },
};

const roundCurrency = (value) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Number(parsed.toFixed(2));
};

const getFeeProfile = ({ symbol = '', category = '', instrument = {} } = {}) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  const categoryProfile = CATEGORY_FEE_PROFILES[meta.categoryKey] || CATEGORY_FEE_PROFILES.commodities;
  const symbolProfile = SYMBOL_FEE_OVERRIDES[String(symbol || instrument.symbol || '').toUpperCase()] || {};

  return {
    ...categoryProfile,
    ...symbolProfile,
  };
};

const calculateHoldingDays = (openedAt, now = new Date()) => {
  const start = openedAt ? new Date(openedAt) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return 0;
  }

  const elapsedMs = Math.max(0, new Date(now).getTime() - start.getTime());
  return Math.floor(elapsedMs / DAY_MS);
};

export const calculatePositionFees = ({
  symbol = '',
  category = '',
  instrument = {},
  side = 'buy',
  lots = 0,
  quantity = 0,
  entryPrice = 0,
  accountType = 'real',
  openedAt = null,
  now = new Date(),
} = {}) => {
  const normalizedAccountType = String(accountType || 'real').toLowerCase();
  const profile = getFeeProfile({ symbol, category, instrument });
  const resolvedLots = Number.parseFloat(lots) > 0
    ? Number.parseFloat(lots)
    : (() => {
        const meta = getInstrumentTradingMeta({ symbol, category, instrument });
        const parsedQuantity = Number.parseFloat(quantity) || 0;
        return meta.contractSize > 0 ? parsedQuantity / meta.contractSize : 0;
      })();
  const tradeValue = calculateUsdFromLots(
    resolvedLots,
    Number.parseFloat(entryPrice) || 0,
    category,
    symbol,
    instrument
  ) || (Number.parseFloat(quantity) || 0) * (Number.parseFloat(entryPrice) || 0);

  if (normalizedAccountType === 'demo' || resolvedLots <= 0 || tradeValue <= 0) {
    return {
      commission: 0,
      swap: 0,
      feeTotal: 0,
      daysHeld: 0,
      profile,
    };
  }

  const direction = String(side || 'buy').toLowerCase() === 'sell' ? 'short' : 'long';
  const daysHeld = calculateHoldingDays(openedAt, now);

  let commission = 0;
  if (Number.isFinite(profile.commissionRate)) {
    commission = tradeValue * profile.commissionRate;
    if (Number.isFinite(profile.commissionMin)) {
      commission = Math.max(Math.abs(commission), profile.commissionMin);
    }
  } else if (Number.isFinite(profile.commissionPerLotSide)) {
    commission = resolvedLots * profile.commissionPerLotSide;
  }

  let swap = 0;
  if (profile.swapMode === 'notional') {
    const rate = direction === 'short'
      ? Number(profile.swapShortRate) || 0
      : Number(profile.swapLongRate) || 0;
    swap = tradeValue * rate * daysHeld;
  } else {
    const perLotRate = direction === 'short'
      ? Number(profile.swapShortPerLotDay) || 0
      : Number(profile.swapLongPerLotDay) || 0;
    swap = resolvedLots * perLotRate * daysHeld;
  }

  commission = roundCurrency(-Math.abs(commission));
  swap = roundCurrency(swap);

  return {
    commission,
    swap,
    feeTotal: roundCurrency(commission + swap),
    daysHeld,
    profile,
  };
};

export const calculateNetPositionPnl = ({
  grossPnl = 0,
  commission = 0,
  swap = 0,
}) => roundCurrency((Number.parseFloat(grossPnl) || 0) + (Number.parseFloat(commission) || 0) + (Number.parseFloat(swap) || 0));

