// frontend/src/components/trading/OpenOrders.jsx
import React from 'react';

const OpenOrders = ({ orders, onCancel }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gold-500/70">
            <th className="pb-3">Symbol</th>
            <th className="pb-3">Type</th>
            <th className="pb-3">Side</th>
            <th className="pb-3">Quantity</th>
            <th className="pb-3">Price</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Created</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-gold-500/10 hover:bg-navy-700/30">
              <td className="py-3 text-white font-medium">{order.symbol}</td>
              <td className="py-3 text-gold-500/70">{order.type}</td>
              <td className="py-3">
                <span className={order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                  {order.side}
                </span>
              </td>
              <td className="py-3 text-gold-500/70">{order.quantity}</td>
              <td className="py-3 text-gold-500/70">${order.price}</td>
              <td className="py-3">
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  {order.status}
                </span>
              </td>
              <td className="py-3 text-gold-500/50">
                {new Date(order.created).toLocaleTimeString()}
              </td>
              <td className="py-3">
                <button
                  onClick={() => onCancel(order.id)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpenOrders;