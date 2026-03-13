// frontend/src/components/trading/PositionsTable.jsx
import React from 'react';

const PositionsTable = ({ positions, onClose }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gold-500/70">
            <th className="pb-3">Symbol</th>
            <th className="pb-3">Type</th>
            <th className="pb-3">Quantity</th>
            <th className="pb-3">Entry Price</th>
            <th className="pb-3">Current Price</th>
            <th className="pb-3">P&L</th>
            <th className="pb-3">Liquidation</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {positions.map((pos) => (
            <tr key={pos.id} className="border-t border-gold-500/10 hover:bg-navy-700/30">
              <td className="py-3 text-white font-medium">{pos.symbol}</td>
              <td className="py-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  pos.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {pos.type}
                </span>
              </td>
              <td className="py-3 text-gold-500/70">{pos.quantity}</td>
              <td className="py-3 text-gold-500/70">${pos.entryPrice.toFixed(2)}</td>
              <td className="py-3 text-gold-500/70">${pos.currentPrice.toFixed(2)}</td>
              <td className="py-3">
                <span className={pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${pos.pnl.toFixed(2)} ({pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                </span>
              </td>
              <td className="py-3 text-gold-500/50">${pos.liquidationPrice}</td>
              <td className="py-3">
                <button
                  onClick={() => onClose(pos.id)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30"
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