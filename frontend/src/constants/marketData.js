// frontend/src/constants/marketData.js

export const MARKET_INSTRUMENTS = [
  // Crypto
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Crypto', price: 43250, change: 2.5, volume: '$28.4B' },
  { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Crypto', price: 2820, change: 1.8, volume: '$14.1B' },
  { symbol: 'BNBUSDT', name: 'Binance Coin', category: 'Crypto', price: 380, change: -0.5, volume: '$1.2B' },
  { symbol: 'SOLUSDT', name: 'Solana', category: 'Crypto', price: 105, change: 5.2, volume: '$3.8B' },
  { symbol: 'ADAUSDT', name: 'Cardano', category: 'Crypto', price: 0.58, change: 1.1, volume: '$0.9B' },
  // Forex
  { symbol: 'EURUSD', name: 'Euro / USD', category: 'Forex', price: 1.0875, change: 0.23, volume: '$3.2T' },
  { symbol: 'GBPUSD', name: 'GBP / USD', category: 'Forex', price: 1.265, change: -0.12, volume: '$0.8T' },
  { symbol: 'USDJPY', name: 'USD / JPY', category: 'Forex', price: 148.5, change: 0.05, volume: '$1.1T' },
  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Stocks', price: 185.2, change: 1.2, volume: '$4.5B' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'Stocks', price: 410.5, change: -0.4, volume: '$2.8B' },
  { symbol: 'TSLA', name: 'Tesla', category: 'Stocks', price: 195.3, change: 3.5, volume: '$6.1B' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Stocks', price: 141.8, change: 0.6, volume: '$1.9B' },
  // Indices
  { symbol: 'SPX', name: 'S&P 500', category: 'Indices', price: 4850, change: 0.32, volume: '$—' },
  { symbol: 'NDX', name: 'Nasdaq 100', category: 'Indices', price: 16800, change: 0.45, volume: '$—' },
  { symbol: 'DJI', name: 'Dow Jones', category: 'Indices', price: 38500, change: 0.18, volume: '$—' },
  // Funds
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', category: 'Funds', price: 484.5, change: 0.31, volume: '$18.2B' },
  { symbol: 'QQQ', name: 'Invesco QQQ', category: 'Funds', price: 412.3, change: 0.42, volume: '$9.8B' },
  // Bonds
  { symbol: 'US10Y', name: 'US 10-Yr Treasury', category: 'Bonds', price: 4.15, change: -0.02, volume: '$—' },
  // Economy
  { symbol: 'DXY', name: 'US Dollar Index', category: 'Economy', price: 104.2, change: 0.15, volume: '$—' },
  // Options
  { symbol: 'VIX', name: 'Volatility Index', category: 'Options', price: 13.5, change: -2.5, volume: '$—' },
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold', category: 'Commodities', price: 2340.5, change: 0.85, volume: '$42.1B' },
  { symbol: 'XAGUSD', name: 'Silver', category: 'Commodities', price: 28.45, change: 1.2, volume: '$8.4B' },
  { symbol: 'BRENT', name: 'Brent Oil', category: 'Commodities', price: 82.4, change: -0.6, volume: '$12.1B' },
  // Brazilian Index
  { symbol: 'IBOV', name: 'BOVESPA', category: 'Brazilian Index', price: 128500, change: 0.45, volume: 'R$24.1B' },
  // Futures
  { symbol: 'ES1!', name: 'S&P 500 E-Mini Future', category: 'Futures', price: 4890, change: 0.25, volume: '$—' },
  { symbol: 'YM1!', name: 'Dow 30 Future', category: 'Futures', price: 38650, change: 0.15, volume: '$—' },
  { symbol: 'CL1!', name: 'Crude Oil Future', category: 'Futures', price: 81.25, change: -0.45, volume: '$—' },
];

export const CATEGORIES = ['All', 'Watchlist', 'Popular', 'Crypto', 'Forex', 'Stocks', 'Indices', 'Commodities', 'Futures', 'Brazilian Index', 'Funds', 'Bonds', 'Economy', 'Options'];

export const CATEGORY_COLORS = {
  Crypto: { text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
  Forex: { text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
  Stocks: { text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
  Indices: { text: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' },
  Funds: { text: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
  Bonds: { text: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-100 dark:border-slate-700' },
  Economy: { text: 'text-gold-500', bg: 'bg-gold-50 dark:bg-gold-500/10', border: 'border-gold-100 dark:border-gold-500/20' },
  Options: { text: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' },
  Commodities: { text: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20' },
  Futures: { text: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-100 dark:border-cyan-500/20' },
  'Brazilian Index': { text: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-100 dark:border-green-500/20' },
  Watchlist: { text: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-100 dark:border-yellow-500/20' },
  Popular: { text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-500/20' },
};
