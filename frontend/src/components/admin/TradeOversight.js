// frontend/src/components/admin/TradeOversight.jsx
import React from 'react';
import { FaChartLine, FaBan, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const TradeOversight = () => {
  const openTrades = [
    { id: 'TRD001', user: 'John Smith', symbol: 'EUR/USD', type: 'BUY', volume: 1.5, openPrice: '1.09234', currentPrice: '1.09567', profit: '+$45.20' },
    { id: 'TRD002', user: 'Sarah Johnson', symbol: 'BTC/USD', type: 'SELL', volume: 0.5, openPrice: '43567.89', currentPrice: '43200.00', profit: '+$183.95' },
    { id: 'TRD003', user: 'Mike Wilson', symbol: 'Gold', type: 'BUY', volume: 10, openPrice: '2045.50', currentPrice: '2032.30', profit: '-$132.00' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-navy-900">Open Trades Oversight</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-navy-100 text-navy-700 rounded-lg text-sm hover:bg-navy-200">
            Refresh
          </button>
          <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
            Emergency Close All
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-navy-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Trade ID</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">User</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Symbol</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Volume</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Open Price</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Current</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">P/L</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-100">
          {openTrades.map((trade) => (
            <tr key={trade.id} className="hover:bg-navy-50">
              <td className="px-4 py-3 text-sm font-medium text-navy-900">{trade.id}</td>
              <td className="px-4 py-3 text-sm text-navy-600">{trade.user}</td>
              <td className="px-4 py-3 text-sm text-navy-600">{trade.symbol}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {trade.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-navy-600">{trade.volume}</td>
              <td className="px-4 py-3 text-sm text-navy-600">{trade.openPrice}</td>
              <td className="px-4 py-3 text-sm text-navy-600">{trade.currentPrice}</td>
              <td className={`px-4 py-3 text-sm font-medium ${
                trade.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {trade.profit}
              </td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <button className="p-1 text-navy-600 hover:text-red-500" title="Force Close">
                    <FaBan size={14} />
                  </button>
                  <button className="p-1 text-navy-600 hover:text-yellow-500" title="Flag for Review">
                    <FaExclamationTriangle size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeOversight;