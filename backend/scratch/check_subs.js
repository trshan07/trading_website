require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const { getTwelveDataSubscriptions } = require('../src/services/marketStreamService');

async function verify() {
  try {
    const { symbols } = await getTwelveDataSubscriptions();
    console.log(`Checking ${symbols.length} symbols with TwelveData API...`);
    
    const BATCH_SIZE = 8;
    const results = { success: [], failed: [] };

    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      const batch = symbols.slice(i, i + BATCH_SIZE);
      const url = `https://api.twelvedata.com/quote?symbol=${batch.join(',')}&apikey=${process.env.TWELVEDATA_API_KEY}`;
      
      try {
        const response = await axios.get(url);
        const data = response.data;
        
        // TwelveData can return a single object if 1 symbol, or a map if multiple
        const items = batch.length === 1 ? { [batch[0]]: data } : data;
        
        for (const sym of batch) {
          const item = items[sym];
          if (item && item.status === 'error') {
            results.failed.push({ symbol: sym, error: item.message });
          } else if (item && item.symbol) {
            results.success.push({ symbol: sym, name: item.name, exchange: item.exchange });
          } else if (item && item.code && item.status === 'error') {
             // global error object for some cases
             results.failed.push({ symbol: sym, error: item.message });
          } else {
             results.failed.push({ symbol: sym, error: 'Unknown response structure' });
          }
        }
      } catch (err) {
        console.error(`Error fetching batch ${batch.join(',')}:`, err.message);
      }
      
      // Delay to avoid rate limits
      await new Promise(res => setTimeout(res, 500));
    }

    console.log('\n--- SUCCESSFUL INSTRUMENTS ---');
    results.success.forEach(s => console.log(`[OK] ${s.symbol} (${s.name} on ${s.exchange})`));

    console.log('\n--- FAILED INSTRUMENTS ---');
    results.failed.forEach(f => console.log(`[FAIL] ${f.symbol}: ${f.error}`));

  } catch (err) {
    console.error('Error:', err);
  }
}

verify();
