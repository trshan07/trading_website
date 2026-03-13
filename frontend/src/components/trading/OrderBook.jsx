// frontend/src/components/trading/OrderBook.jsx
import React from 'react';
import { FaWaveSquare } from 'react-icons/fa';

const OrderBook = () => {
  const mockBids = [
    { price: 43150, size: 0.45, total: 19417.5 },
    { price: 43100, size: 0.78, total: 33618 },
    { price: 43050, size: 1.23, total: 52951.5 },
    { price: 43000, size: 2.15, total: 92450 },
    { price: 42950, size: 1.89, total: 81175.5 },
  ];

  const mockAsks = [
    { price: 43250, size: 0.32, total: 13840 },
    { price: 43300, size: 0.67, total: 29011 },
    { price: 43350, size: 1.12, total: 48552 },
    { price: 43400, size: 1.45, total: 62930 },
    { price: 43450, size: 0.95, total: 41277.5 },
  ];

  return (
    <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
      <h3 className="text-sm font-semibold text-gold-500 mb-3 flex items-center">
        <FaWaveSquare className="mr-2" />
        Order Book
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <div>
          <div className="flex justify-between text-xs text-gold-500/70 mb-2 px-2">
            <span>Price (USD)</span>
            <span>Size (BTC)</span>
            <span>Total</span>
          </div>
          {mockBids.map((bid, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-all" 
                   style={{ width: `${(bid.size / 2.15) * 100}%` }} />
              <div className="flex justify-between text-xs py-1 px-2 relative">
                <span className="text-green-400">${bid.price}</span>
                <span className="text-white">{bid.size}</span>
                <span className="text-gold-500/50">${bid.total.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Asks */}
        <div>
          <div className="flex justify-between text-xs text-gold-500/70 mb-2 px-2">
            <span>Price (USD)</span>
            <span>Size (BTC)</span>
            <span>Total</span>
          </div>
          {mockAsks.map((ask, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute inset-0 bg-red-500/10 group-hover:bg-red-500/20 transition-all" 
                   style={{ width: `${(ask.size / 1.45) * 100}%` }} />
              <div className="flex justify-between text-xs py-1 px-2 relative">
                <span className="text-red-400">${ask.price}</span>
                <span className="text-white">{ask.size}</span>
                <span className="text-gold-500/50">${ask.total.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;