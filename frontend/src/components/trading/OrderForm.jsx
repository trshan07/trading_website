// frontend/src/components/trading/OrderForm.jsx
import React, { useState } from 'react';

const OrderForm = ({ onSubmit }) => {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [quantity, setQuantity] = useState(0.1);
  const [price, setPrice] = useState(43250);
  const [stopPrice, setStopPrice] = useState(43000);
  const [takeProfit, setTakeProfit] = useState(43500);
  const [stopLoss, setStopLoss] = useState(42800);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type: orderType, side, quantity, price, stopPrice, takeProfit, stopLoss });
  };

  return (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4">
      <h3 className="text-lg font-semibold text-gold-500 mb-4">Place Order</h3>
      
      {/* Order Type Selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {['market', 'limit', 'stop', 'stop_limit'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setOrderType(type)}
            className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-all ${
              orderType === type
                ? 'bg-gold-500 text-navy-900'
                : 'bg-navy-700 text-gold-500/70 hover:bg-navy-600'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            side === 'buy'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
              : 'bg-navy-700 text-gold-500/70 hover:bg-navy-600'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            side === 'sell'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'bg-navy-700 text-gold-500/70 hover:bg-navy-600'
          }`}
        >
          Sell
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Quantity Input */}
        <div className="mb-4">
          <label className="block text-xs text-gold-500/70 mb-2">Quantity (BTC)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              step="0.01"
              min="0.01"
              required
              className="flex-1 px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
            />
            <div className="flex space-x-1">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => setQuantity(0.1 * (percent / 25))}
                  className="px-2 py-1 bg-navy-700 text-gold-500 text-xs rounded hover:bg-navy-600"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price Input (for limit/stop orders) */}
        {(orderType === 'limit' || orderType === 'stop_limit') && (
          <div className="mb-4">
            <label className="block text-xs text-gold-500/70 mb-2">Limit Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              required
              className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
            />
          </div>
        )}

        {/* Stop Price (for stop/stop_limit orders) */}
        {(orderType === 'stop' || orderType === 'stop_limit') && (
          <div className="mb-4">
            <label className="block text-xs text-gold-500/70 mb-2">Stop Price (USD)</label>
            <input
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(parseFloat(e.target.value))}
              required
              className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
            />
          </div>
        )}

        {/* Advanced Options */}
        <div className="mb-4 p-3 bg-navy-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-gold-500 mb-3">Take Profit / Stop Loss</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gold-500/70 mb-1">Take Profit (USD)</label>
              <input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-navy-800 border border-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gold-500/70 mb-1">Stop Loss (USD)</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-navy-800 border border-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-navy-700/30 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gold-500/70">Order Value</span>
            <span className="text-white font-medium">${(quantity * price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gold-500/70">Margin Required (10%)</span>
            <span className="text-gold-400 font-medium">${(quantity * price * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gold-500/70">Commission (0.1%)</span>
            <span className="text-gold-500/50">${(quantity * price * 0.001).toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full px-4 py-3 rounded-lg font-bold transition-all ${
            side === 'buy'
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
          }`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {quantity} BTC
        </button>
      </form>
    </div>
  );
};

export default OrderForm;