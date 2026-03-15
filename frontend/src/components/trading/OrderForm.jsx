// frontend/src/components/trading/OrderForm.jsx
import React, { useState } from 'react';

const OrderForm = ({ onSubmit, symbol = 'BTCUSD', compact = false }) => {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [leverage, setLeverage] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      symbol,
      type: orderType,
      side,
      amount: parseFloat(amount),
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
      leverage
    });
  };

  const quickAmounts = [100, 500, 1000, 5000];

  if (compact) {
    return (
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4">
        <h3 className="text-sm font-semibold text-gold-500 mb-3">Quick Trade</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`py-2 rounded-lg text-sm font-medium ${
                side === 'buy'
                  ? 'bg-green-500 text-white'
                  : 'bg-navy-700 text-gold-500/70 hover:text-gold-500'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`py-2 rounded-lg text-sm font-medium ${
                side === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-navy-700 text-gold-500/70 hover:text-gold-500'
              }`}
            >
              SELL
            </button>
          </div>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (USD)"
            className="w-full px-3 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
          />

          <div className="grid grid-cols-4 gap-1">
            {quickAmounts.map(qty => (
              <button
                key={qty}
                type="button"
                onClick={() => setAmount(qty)}
                className="px-1 py-1 bg-navy-700 text-gold-500 rounded text-xs hover:bg-navy-600"
              >
                ${qty}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-bold ${
              side === 'buy'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4">
      <h3 className="text-sm font-semibold text-gold-500 mb-4">Place Order - {symbol}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Type Selection */}
        <div className="flex space-x-2 bg-navy-700 rounded-lg p-1">
          {['market', 'limit', 'stop'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2 text-xs font-medium rounded ${
                orderType === type
                  ? 'bg-gold-500 text-navy-950'
                  : 'text-gold-500/70 hover:text-gold-500'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`py-3 rounded-lg font-medium ${
              side === 'buy'
                ? 'bg-green-500 text-white'
                : 'bg-navy-700 text-gold-500/70 hover:text-gold-500'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`py-3 rounded-lg font-medium ${
              side === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-navy-700 text-gold-500/70 hover:text-gold-500'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs text-gold-500/70 mb-1">Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map(qty => (
            <button
              key={qty}
              type="button"
              onClick={() => setAmount(qty)}
              className="px-2 py-1 bg-navy-700 text-gold-500 rounded text-xs hover:bg-navy-600"
            >
              ${qty}
            </button>
          ))}
        </div>

        {/* Price Input for Limit Orders */}
        {orderType !== 'market' && (
          <div>
            <label className="block text-xs text-gold-500/70 mb-1">
              {orderType === 'limit' ? 'Limit Price' : 'Stop Price'} (USD)
            </label>
            <input
              type="number"
              value={orderType === 'limit' ? price : stopPrice}
              onChange={(e) => orderType === 'limit' ? setPrice(e.target.value) : setStopPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
            />
          </div>
        )}

        {/* Leverage Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label className="text-gold-500/70">Leverage: {leverage}x</label>
            <span className="text-gold-500/50">Max: 100x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-navy-700/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gold-500/70">Total Cost</span>
            <span className="text-white">${amount || '0.00'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gold-500/70">Required Margin</span>
            <span className="text-yellow-400">${amount ? (parseFloat(amount) / leverage).toFixed(2) : '0.00'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gold-500/70">Fee (0.1%)</span>
            <span className="text-red-400">${amount ? (parseFloat(amount) * 0.001).toFixed(2) : '0.00'}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-bold ${
            side === 'buy'
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;