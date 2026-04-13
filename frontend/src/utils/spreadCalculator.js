// frontend/src/utils/spreadCalculator.js
import { MARKET_INSTRUMENTS } from '../constants/marketData';

export const calculateSpreads = (symbol, currentPrice) => {
  if (!currentPrice) return { bidPrice: 0, askPrice: 0, spreadAmt: 0 };

  const instrument = MARKET_INSTRUMENTS.find(i => i.symbol === symbol);
  const category = instrument ? instrument.category : 'Unknown';

  let spreadAmt = 0;

  switch (category) {
    case 'Crypto':
      // 0.15% spread for crypto
      spreadAmt = currentPrice * 0.0015;
      break;
    case 'Forex':
      // Very tight spread for forex (e.g., 2 pips = 0.0002 for major pairs)
      // Since some pairs like USDJPY are ~150, we adjust the pip size
      spreadAmt = currentPrice > 100 ? 0.02 : 0.0002;
      break;
    case 'Stocks':
    case 'Funds':
      // Fixed cent spread for stocks / ETF (e.g., $0.10)
      spreadAmt = 0.10;
      break;
    case 'Indices':
    case 'Futures':
    case 'Brazilian Index':
      // Points spread for indices (e.g., 1.5 points)
      spreadAmt = 1.5;
      break;
    case 'Commodities':
      // ~0.30 dollars for commodities like Gold
      spreadAmt = 0.30;
      break;
    default:
      // Default 0.1% spread
      spreadAmt = currentPrice * 0.001;
      break;
  }

  // Ensure spread is never more than 1% as a safety check
  if (spreadAmt > currentPrice * 0.01) {
    spreadAmt = currentPrice * 0.01;
  }

  const bidPrice = Number(currentPrice - (spreadAmt / 2));
  const askPrice = Number(currentPrice + (spreadAmt / 2));

  return {
    bidPrice: bidPrice.toFixed(currentPrice > 100 ? 2 : 5),
    askPrice: askPrice.toFixed(currentPrice > 100 ? 2 : 5),
    spreadAmt
  };
};
