// frontend/src/constants/marketData.js

export const MARKET_INSTRUMENTS = [
  // Forex majors
  { symbol: 'EURUSD', name: 'Euro / USD', category: 'Forex', price: 1.0875, change: 0.23, volume: '$3.2T' },
  { symbol: 'GBPUSD', name: 'GBP / USD', category: 'Forex', price: 1.2650, change: -0.12, volume: '$0.8T' },
  { symbol: 'USDJPY', name: 'USD / JPY', category: 'Forex', price: 148.5000, change: 0.05, volume: '$1.1T' },
  { symbol: 'USDCHF', name: 'USD / CHF', category: 'Forex', price: 0.9114, change: 0.04, volume: '$0.4T' },
  { symbol: 'AUDUSD', name: 'AUD / USD', category: 'Forex', price: 0.6584, change: 0.09, volume: '$0.6T' },
  { symbol: 'USDCAD', name: 'USD / CAD', category: 'Forex', price: 1.3621, change: -0.03, volume: '$0.5T' },

  // Forex minors & exotics
  { symbol: 'EURGBP', name: 'Euro / GBP', category: 'Forex', price: 0.8594, change: 0.08, volume: '$0.3T' },
  { symbol: 'EURJPY', name: 'Euro / JPY', category: 'Forex', price: 161.8400, change: 0.14, volume: '$0.5T' },
  { symbol: 'GBPJPY', name: 'GBP / JPY', category: 'Forex', price: 187.3100, change: -0.09, volume: '$0.4T' },
  { symbol: 'USDSGD', name: 'USD / SGD', category: 'Forex', price: 1.3487, change: 0.02, volume: '$0.2T' },
  { symbol: 'USDTRY', name: 'USD / TRY', category: 'Forex', price: 32.4180, change: 0.21, volume: '$0.1T' },

  // Indices
  { symbol: 'US500', name: 'US 500', category: 'Indices', price: 5235.40, change: 0.31, volume: '-' },
  { symbol: 'NAS100', name: 'Nasdaq 100', category: 'Indices', price: 18244.70, change: 0.44, volume: '-' },
  { symbol: 'US30', name: 'US 30', category: 'Indices', price: 39280.50, change: 0.17, volume: '-' },
  { symbol: 'UK100', name: 'UK 100', category: 'Indices', price: 8162.40, change: -0.11, volume: '-' },
  { symbol: 'DE40', name: 'Germany 40', category: 'Indices', price: 18115.30, change: 0.22, volume: '-' },
  { symbol: 'JP225', name: 'Japan 225', category: 'Indices', price: 38246.00, change: 0.27, volume: '-' },

  // Commodities
  { symbol: 'XAUUSD', name: 'Gold', category: 'Commodities', price: 2340.50, change: 0.85, volume: '$42.1B' },
  { symbol: 'XAGUSD', name: 'Silver', category: 'Commodities', price: 28.4500, change: 1.20, volume: '$8.4B' },
  { symbol: 'WTI', name: 'WTI Crude Oil', category: 'Commodities', price: 78.42, change: -0.53, volume: '$10.8B' },
  { symbol: 'BRENT', name: 'Brent Oil', category: 'Commodities', price: 82.40, change: -0.60, volume: '$12.1B' },

  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin / USD', category: 'Crypto', price: 43250.00, change: 2.50, volume: '$28.4B' },
  { symbol: 'ETHUSD', name: 'Ethereum / USD', category: 'Crypto', price: 2820.00, change: 1.80, volume: '$14.1B' },
  { symbol: 'XRPUSD', name: 'Ripple / USD', category: 'Crypto', price: 0.5612, change: 0.72, volume: '$1.1B' },

  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Stocks', price: 185.20, change: 1.20, volume: '$4.5B' },
  { symbol: 'TSLA', name: 'Tesla', category: 'Stocks', price: 195.30, change: 3.50, volume: '$6.1B' },
  { symbol: 'AMZN', name: 'Amazon', category: 'Stocks', price: 182.30, change: 0.95, volume: '$3.6B' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'Stocks', price: 410.50, change: -0.40, volume: '$2.8B' },

  // Additional compatibility symbols
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Crypto', price: 43250.00, change: 2.50, volume: '$28.4B' },
  { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Crypto', price: 2820.00, change: 1.80, volume: '$14.1B' },
  { symbol: 'BNBUSDT', name: 'Binance Coin', category: 'Crypto', price: 380.00, change: -0.50, volume: '$1.2B' },
  { symbol: 'SOLUSDT', name: 'Solana', category: 'Crypto', price: 105.00, change: 5.20, volume: '$3.8B' },
  { symbol: 'SOLUSD', name: 'Solana / USD', category: 'Crypto', price: 105.00, change: 5.20, volume: '$3.8B' },
  { symbol: 'ADAUSDT', name: 'Cardano', category: 'Crypto', price: 0.58, change: 1.10, volume: '$0.9B' },
  { symbol: 'ADAUSD', name: 'Cardano / USD', category: 'Crypto', price: 0.58, change: 1.10, volume: '$0.9B' },
  { symbol: 'NZDUSD', name: 'NZD / USD', category: 'Forex', price: 0.6015, change: 0.06, volume: '$0.2T' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Stocks', price: 141.80, change: 0.60, volume: '$1.9B' },
  { symbol: 'SPX', name: 'S&P 500', category: 'Indices', price: 4850.00, change: 0.32, volume: '-' },
  { symbol: 'NDX', name: 'Nasdaq 100', category: 'Indices', price: 16800.00, change: 0.45, volume: '-' },
  { symbol: 'DJI', name: 'Dow Jones', category: 'Indices', price: 38500.00, change: 0.18, volume: '-' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', category: 'Funds', price: 484.50, change: 0.31, volume: '$18.2B' },
  { symbol: 'QQQ', name: 'Invesco QQQ', category: 'Funds', price: 412.30, change: 0.42, volume: '$9.8B' },
  { symbol: 'US10Y', name: 'US 10-Yr Treasury', category: 'Bonds', price: 4.15, change: -0.02, volume: '-' },
  { symbol: 'DXY', name: 'US Dollar Index', category: 'Economy', price: 104.20, change: 0.15, volume: '-' },
  { symbol: 'VIX', name: 'Volatility Index', category: 'Options', price: 13.50, change: -2.50, volume: '-' },
  { symbol: 'IBOV', name: 'BOVESPA', category: 'Brazilian Index', price: 128500.00, change: 0.45, volume: 'R$24.1B' },
  { symbol: 'ES1!', name: 'S&P 500 E-Mini Future', category: 'Futures', price: 4890.00, change: 0.25, volume: '-' },
  { symbol: 'YM1!', name: 'Dow 30 Future', category: 'Futures', price: 38650.00, change: 0.15, volume: '-' },
  { symbol: 'CL1!', name: 'Crude Oil Future', category: 'Futures', price: 81.25, change: -0.45, volume: '-' },
];

export const CATEGORIES = ['Crypto', 'Forex', 'Stocks', 'Indices', 'Commodities', 'Funds', 'Bonds', 'Economy', 'Options', 'Futures', 'Brazilian Index'];

export const CATEGORY_COLORS = {
  Crypto: { text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
  Forex: { text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
  Stocks: { text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
  Indices: { text: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' },
  Commodities: { text: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20' },
  Funds: { text: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
  Bonds: { text: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-100 dark:border-slate-700' },
  Economy: { text: 'text-gold-500', bg: 'bg-gold-50 dark:bg-gold-500/10', border: 'border-gold-100 dark:border-gold-500/20' },
  Options: { text: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' },
  Futures: { text: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-100 dark:border-cyan-500/20' },
  'Brazilian Index': { text: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-100 dark:border-green-500/20' },
};
