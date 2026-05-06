/**
 * backend/src/utils/tradingMath.js
 * 
 * Central logic for trading calculations as per system requirements.
 * Implements Balance, Margin, Lot Sizes, and Order Execution rules.
 */

class TradingAccount {
    /**
     * @param {number} balance - Starting capital plus realized profit/loss
     * @param {number} leverage - Account-wide leverage (e.g., 100 for 1:100)
     * @param {number} credit - Optional credit bonus
     */
    constructor(balance, leverage, credit = 0) {
        this.balance = Number(balance) || 0;
        this.leverage = Number(leverage) || 100;
        this.credit = Number(credit) || 0;
        this.openTrades = [];
    }

    /**
     * Equity = Balance + Credit + Floating (Unrealized) P&L
     */
    get equity() {
        return this.balance + this.credit + this.floatingPnL;
    }

    /**
     * Floating P&L = Sum of unrealized P&L from all open trades
     */
    get floatingPnL() {
        return this.openTrades.reduce((sum, trade) => sum + trade.unrealizedPnL(), 0);
    }

    /**
     * Total Margin = Sum of margin required for each open trade
     */
    get margin() {
        return this.openTrades.reduce((sum, trade) => sum + trade.marginRequired(this.leverage), 0);
    }

    /**
     * Free Margin = Equity - Margin
     */
    get freeMargin() {
        return this.equity - this.margin;
    }

    /**
     * Margin Level = (Equity / Margin) * 100
     */
    get marginLevel() {
        if (this.margin <= 0) return 0;
        return (this.equity / this.margin) * 100;
    }

    /**
     * Opens a new trade and adds it to the account's open trades
     */
    openTrade(instrument, category, lotSize, entryPrice, direction) {
        const trade = new Trade(instrument, category, lotSize, entryPrice, direction);
        this.openTrades.push(trade);
        return trade;
    }

    /**
     * Closes a trade and updates the balance
     */
    closeTrade(trade, closingPrice) {
        const pnl = trade.realizedPnL(closingPrice);
        this.balance += pnl;
        this.openTrades = this.openTrades.filter(t => t !== trade);
        return pnl;
    }
}

class Trade {
    /**
     * @param {string} symbol - Instrument symbol (e.g., EURUSD)
     * @param {string} category - Instrument category (forex, gold, crypto)
     * @param {number} lotSize - Size in lots (e.g., 0.01)
     * @param {number} entryPrice - Price at entry
     * @param {string} direction - "buy" or "sell"
     */
    constructor(symbol, category, lotSize, entryPrice, direction) {
        this.symbol = symbol;
        this.category = (category || "").toLowerCase();
        this.lotSize = Number(lotSize) || 0;
        this.entryPrice = Number(entryPrice) || 0;
        this.direction = (direction || "buy").toLowerCase();
        this.currentPrice = entryPrice;
    }

    /**
     * Lot Size Standards:
     * Forex: 1 lot = 100,000 units
     * Gold: 1 lot = 100 oz
     * Crypto: 1 lot = 1 unit (e.g., 1 BTC)
     */
    units() {
        if (this.category === "forex") return this.lotSize * 100000;
        if (this.category === "gold" || this.symbol === "XAUUSD") return this.lotSize * 100;
        if (this.category === "crypto") return this.lotSize;
        // Default to standard lot if unknown
        return this.lotSize * 100;
    }

    /**
     * Margin Required = (Entry Price * Units) / Leverage
     */
    marginRequired(leverage) {
        return (this.entryPrice * this.units()) / leverage;
    }

    /**
     * Unrealized P&L = (Current Price - Entry Price) * Units (Inverted for Sell)
     */
    unrealizedPnL() {
        const movement = (this.currentPrice - this.entryPrice) * (this.direction === "buy" ? 1 : -1);
        return movement * this.units();
    }

    /**
     * Realized P&L = (Closing Price - Entry Price) * Units (Inverted for Sell)
     */
    realizedPnL(closingPrice) {
        this.currentPrice = closingPrice;
        return this.unrealizedPnL();
    }

    /**
     * Pip Value Calculation
     * For Gold: 0.01 lot = $0.10 per $0.01 move (means $10 per $1 move)
     * For Forex: 0.01 lot = $0.10 per pip (0.0001 move)
     */
    getPipValue() {
        const units = this.units();
        if (this.category === "forex") {
            const pipSize = this.symbol.includes("JPY") ? 0.01 : 0.0001;
            return pipSize * units;
        }
        if (this.category === "gold" || this.symbol === "XAUUSD") {
            return 0.01 * units; // $0.01 move value
        }
        return 1 * units; // $1 move value for crypto/others
    }
}

module.exports = {
    TradingAccount,
    Trade
};
