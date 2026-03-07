// frontend/src/pages/client/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaChartLine,
  FaWallet,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const DashboardPage = () => {
  const accountSummary = [
    { label: 'Balance', value: '$25,450.00', change: '+$1,230', color: 'text-green-500' },
    { label: 'Equity', value: '$26,780.00', change: '+$1,450', color: 'text-green-500' },
    { label: 'Free Margin', value: '$24,230.00', change: '-$220', color: 'text-red-500' },
    { label: 'Margin Level', value: '356%', change: '+12%', color: 'text-green-500' },
  ];

  const openPositions = [
    { symbol: 'EUR/USD', type: 'BUY', volume: '1.5', openPrice: '1.09234', currentPrice: '1.09567', profit: '+$45.20' },
    { symbol: 'BTC/USD', type: 'SELL', volume: '0.5', openPrice: '43567.89', currentPrice: '43200.00', profit: '+$183.95' },
    { symbol: 'Gold', type: 'BUY', volume: '10', openPrice: '2045.50', currentPrice: '2032.30', profit: '-$132.00' },
  ];

  const chartData = [
    { time: '10:00', value: 1000 },
    { time: '11:00', value: 1200 },
    { time: '12:00', value: 1100 },
    { time: '13:00', value: 1400 },
    { time: '14:00', value: 1300 },
    { time: '15:00', value: 1600 },
    { time: '16:00', value: 1500 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-navy-300">Here's what's happening with your trading account today.</p>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accountSummary.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
            <p className="text-sm text-navy-500 mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-navy-900">{item.value}</p>
            <p className={`text-xs ${item.color} flex items-center mt-2`}>
              {item.change.startsWith('+') ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
              {item.change} (24h)
            </p>
          </div>
        ))}
      </div>

      {/* Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-navy-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-navy-900">Equity Curve</h2>
            <select className="text-sm border border-navy-200 rounded-lg px-3 py-1">
              <option>1D</option>
              <option>1W</option>
              <option>1M</option>
              <option>3M</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#002366" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#002366" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#4A5568" />
              <YAxis stroke="#4A5568" />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#002366" fillOpacity={1} fill="url(#colorEquity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/deposit" className="block p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <FaWallet className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-navy-900">Deposit Funds</p>
                  <p className="text-xs text-navy-500">Add money to your account</p>
                </div>
              </div>
            </Link>
            <Link to="/withdrawal" className="block p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <FaWallet className="text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-navy-900">Withdraw Funds</p>
                  <p className="text-xs text-navy-500">Withdraw to your bank</p>
                </div>
              </div>
            </Link>
            <Link to="/trading" className="block p-3 bg-gold-500 rounded-lg hover:bg-gold-600 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-navy-900 bg-opacity-20 rounded-lg mr-3">
                  <FaExchangeAlt className="text-navy-900" />
                </div>
                <div>
                  <p className="font-medium text-navy-900">Start Trading</p>
                  <p className="text-xs text-navy-900 opacity-75">Open new positions</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-white rounded-xl shadow-lg border border-navy-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-navy-900">Open Positions</h2>
          <Link to="/trading" className="text-gold-500 hover:text-gold-600 text-sm font-medium">
            View All
          </Link>
        </div>
        <table className="w-full">
          <thead className="bg-navy-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Volume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Open Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Current</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Profit/Loss</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {openPositions.map((position, index) => (
              <tr key={index} className="hover:bg-navy-50">
                <td className="px-6 py-4 text-sm font-medium text-navy-900">{position.symbol}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    position.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {position.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-navy-600">{position.volume}</td>
                <td className="px-6 py-4 text-sm text-navy-600">{position.openPrice}</td>
                <td className="px-6 py-4 text-sm text-navy-600">{position.currentPrice}</td>
                <td className={`px-6 py-4 text-sm font-medium ${
                  position.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {position.profit}
                </td>
                <td className="px-6 py-4">
                  <button className="text-gold-500 hover:text-gold-600">
                    <FaEye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;