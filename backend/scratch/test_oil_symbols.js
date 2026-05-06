const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.TWELVEDATA_API_KEY;
const symbols = ['NG/USD'];

async function checkSymbols() {
    console.log(`Checking symbols with API Key: ${API_KEY ? 'FOUND' : 'MISSING'}`);
    if (!API_KEY) return;

    for (const symbol of symbols) {
        try {
            console.log(`Fetching price for ${symbol}...`);
            const response = await axios.get(`https://api.twelvedata.com/price`, {
                params: {
                    symbol: symbol,
                    apikey: API_KEY
                }
            });
            console.log(`Symbol: ${symbol} ->`, response.data);
        } catch (error) {
            console.log(`Symbol: ${symbol} -> ERROR: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

checkSymbols();
