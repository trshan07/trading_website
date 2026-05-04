const marketStreamService = require('../src/services/marketStreamService');
const { hasTwelveDataApiKey } = require('../src/services/marketDataService');

async function testSubscriptions() {
  console.log('Has API Key:', hasTwelveDataApiKey());
  const subs = await marketStreamService.getTwelveDataSubscriptions();
  console.log('Symbols to subscribe:', subs.symbols);
  console.log('Symbol Map keys:', Object.keys(subs.symbolMap));
}

testSubscriptions();
