// frontend/src/components/trading/PositionsTable.jsx
import React from 'react';

const PositionsTable = ({ positions = [], onClose, compact = false }) => {
  if (compact) {
    return (
      <div className="space-y-3">
        {positions.map(position => (
          <div key={position.id} className="bg-navy-700/30 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-white font-medium">{position.symbol}</span>
                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                  position.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {position.type}
                </span>
              </div>
              <span className={`text-sm font-medium ${
                position.pnl > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {position.pnl > 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-gold-500/50">Size:</span>
                <span className="ml-1 text-white">{position.quantity}</span>
              </div>
              <div>
                <span className="text-gold-500/50">Entry:</span>
                <span className="ml-1 text-white">${position.entryPrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gold-500/50">Current:</span>
                <span className="ml-1 text-white">${position.currentPrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gold-500/50">P&L:</span>
                <span className={`ml-1 ${position.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${position.pnl.toLocaleString()}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onClose(position.id)}
              className="w-full px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30"
            >
              Close Position
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gold-500/70 border-b border-gold-500/20">
            <th className="px-4 py-2 text-left">Symbol</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-right">Size</th>
            <th className="px-4 py-2 text-right">Entry Price</th>
            <th className="px-4 py-2 text-right">Current Price</th>
            <th className="px-4 py-2 text-right">P&L</th>
            <th className="px-4 py-2 text-right">P&L %</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(position => (
            <tr key={position.id} className="border-b border-gold-500/10 hover:bg-navy-700/30">
              <td className="px-4 py-3 text-sm text-white">{position.symbol}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  position.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {position.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right text-white">{position.quantity}</td>
              <td className="px-4 py-3 text-sm text-right text-white">${position.entryPrice.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-right text-white">${position.currentPrice.toLocaleString()}</td>
              <td className={`px-4 py-3 text-sm text-right ${position.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${position.pnl.toLocaleString()}
              </td>
              <td className={`px-4 py-3 text-sm text-right ${position.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {position.pnl > 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onClose(position.id)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                >
                  Close
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PositionsTable;