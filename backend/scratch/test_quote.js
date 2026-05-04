const { getCanonicalQuote } = require('../src/services/marketSnapshotService');
const { normalizeSymbol } = require('../src/services/marketDataService');

async function testQuote() {
  const symbol = 'BTCUSD';
  console.log(`Fetching quote for ${symbol}...`);
  try {
    const quote = await getCanonicalQuote(symbol, { refresh: true });
    console.log('Result:', JSON.stringify(quote, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testQuote();
