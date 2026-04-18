const axios = require('axios');

/**
 * Helper to generate mock data for failover or non-Binance symbols
 */
const generateMockData = (basePrice, count = 300) => {
  let prev = parseFloat(basePrice) || 100;
  const data = [];
  const now = Math.floor(Date.now() / 1000);
  const intervalSec = 15 * 60; // 15m default
  
  for (let i = count; i > 0; i--) {
    const open = prev;
    const close = open + (Math.random() - 0.5) * (open * 0.01);
    const high = Math.max(open, close) + Math.random() * (open * 0.005);
    const low = Math.min(open, close) - Math.random() * (open * 0.005);
    
    data.push([
      (now - (i * intervalSec)) * 1000, // time in ms to match Binance format
      open.toString(),
      high.toString(),
      low.toString(),
      close.toString(),
      "100", // volume mock
      (now - ((i-1) * intervalSec)) * 1000,
      "0", "0", "0", "0", "0"
    ]);
    prev = close;
  }
  return data;
};

exports.getMarketHistory = async (req, res) => {
  const { symbol, interval } = req.query;
  const iv = interval || '15m';
  const sym = (symbol || 'BTCUSDT').replace(/[^A-Z0-9]/g, '');
  
  try {
    // Only attempt Binance for clear crypto/known symbols
    const isBinanceFull = sym.endsWith('USDT') || sym.endsWith('BTC') || ['BTC', 'ETH', 'SOL', 'ADA', 'BNB'].some(s => sym.startsWith(s));
    
    if (!isBinanceFull) {
        throw new Error('Not a Binance symbol');
    }

    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: sym,
        interval: iv,
        limit: 300
      },
      timeout: 5000
    });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    // Failover to mock data silently to keep frontend clean and functional
    console.log(`[MarketProxy] Falling back to mock data for ${sym} due to: ${error.message}`);
    const mockData = generateMockData(req.query.initialPrice || 100);
    return res.status(200).json({
      success: true,
      data: mockData,
      isMock: true
    });
  }
};
