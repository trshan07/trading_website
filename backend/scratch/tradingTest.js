/**
 * backend/scratch/tradingTest.js
 * 
 * Validates the TradingAccount and Trade classes against user-provided examples.
 */

const { TradingAccount, Trade } = require('../src/utils/tradingMath');

console.log("------------------ TRADING SYSTEM VALIDATION ------------------");

// Example A – Gold (XAU/USD)
console.log("\n[Example A - Gold]");
const goldAccount = new TradingAccount(300, 100);
const goldTrade = goldAccount.openTrade("XAUUSD", "gold", 0.01, 2000, "buy");
goldTrade.currentPrice = 2010; // TP +$10

console.log("Expected Margin: $20 | Actual:", goldTrade.marginRequired(goldAccount.leverage));
console.log("Expected P&L: $10 | Actual:", goldTrade.unrealizedPnL());
console.log("Account Equity: $" + goldAccount.equity);
console.log("Free Margin: $" + goldAccount.freeMargin);

// Example B – Forex (EUR/USD)
console.log("\n[Example B - Forex]");
const forexAccount = new TradingAccount(300, 100);
const forexTrade = forexAccount.openTrade("EURUSD", "forex", 0.01, 1.1000, "buy");
forexTrade.currentPrice = 1.1020; // +20 pips

console.log("Expected Margin: $11 | Actual:", forexTrade.marginRequired(forexAccount.leverage).toFixed(2));
console.log("Pip Value: $0.10 | Actual:", forexTrade.getPipValue().toFixed(2));
console.log("Expected P&L: $2 | Actual:", forexTrade.unrealizedPnL().toFixed(2));
console.log("Account Equity: $" + forexAccount.equity.toFixed(2));

// Example C – Crypto (BTC/USD)
console.log("\n[Example C - Crypto]");
const cryptoAccount = new TradingAccount(300, 10);
const cryptoTrade = cryptoAccount.openTrade("BTCUSD", "crypto", 0.01, 60000, "buy");
cryptoTrade.currentPrice = 90000; // +$30,000 price move = $300 profit for 0.01 lot

console.log("Expected Margin: $60 | Actual:", cryptoTrade.marginRequired(cryptoAccount.leverage));
console.log("Expected P&L: $300 | Actual:", cryptoTrade.unrealizedPnL());
console.log("Account Equity: $" + cryptoAccount.equity);
console.log("Free Margin: $" + cryptoAccount.freeMargin);

console.log("\n------------------ VALIDATION COMPLETE ------------------");
