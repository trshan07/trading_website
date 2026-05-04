const { getMergedInstrumentConfig, fetchMarketQuotes, hasTwelveDataApiKey } = require('../src/services/marketDataService');
require('dotenv').config({ path: '../.env' });

async function debugSymbols() {
  const symbols = ['BTCUSD', 'AAPL', 'EURUSD'];
  console.log('Has API Key:', hasTwelveDataApiKey());
  
  for (const symbol of symbols) {
    const config = await getMergedInstrumentConfig(symbol);
    console.log(`Instrument Config for ${symbol}:`, JSON.stringify(config, null, 2));
  }
  
  console.log('Fetching market quotes...');
  const results = await fetchMarketQuotes(symbols);
  console.log('Results:', JSON.stringify(results, null, 2));
}

debugSymbols();
