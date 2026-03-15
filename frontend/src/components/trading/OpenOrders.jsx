// frontend/src/components/trading/OpenOrders.jsx
import React from 'react';

const OpenOrders = ({ orders = [], onCancel, compact = false }) => {
  if (compact) {
    return (
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-navy-700/30 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">{order.symbol}</span>
              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                {order.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-gold-500/50">Type:</span>
                <span className="ml-1 text-white">{order.type}</span>
              </div>
              <div>
                <span className="text-gold-500/50">Side:</span>
                <span className={`ml-1 ${order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                  {order.side}
                </span>
              </div>
              <div>
                <span className="text-gold-500/50">Qty:</span>
                <span className="ml-1 text-white">{order.quantity}</span>
              </div>
              <div>
                <span className="text-gold-500/50">Price:</span>
                <span className="ml-1 text-white">${order.price.toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={() => onCancel(order.id)}
              className="w-full px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30"
            >
              Cancel Order
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
            <th className="px-4 py-2 text-left">Side</th>
            <th className="px-4 py-2 text-right">Quantity</th>
            <th className="px-4 py-2 text-right">Price</th>
            <th className="px-4 py-2 text-right">Created</th>
            <th className="px-4 py-2 text-center">Status</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b border-gold-500/10 hover:bg-navy-700/30">
              <td className="px-4 py-3 text-sm text-white">{order.symbol}</td>
              <td className="px-4 py-3 text-sm text-gold-500/70">{order.type}</td>
              <td className="px-4 py-3">
                <span className={`text-sm ${order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                  {order.side}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right text-white">{order.quantity}</td>
              <td className="px-4 py-3 text-sm text-right text-white">${order.price.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-right text-gold-500/50">
                {new Date(order.created).toLocaleTimeString()}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onCancel(order.id)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
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