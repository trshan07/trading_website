// frontend/src/components/client/ClientSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaChartLine,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaHistory,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaWallet,
  FaFileAlt
} from 'react-icons/fa';

const ClientSidebar = () => {
  const menuItems = [
    { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/trading', icon: FaExchangeAlt, label: 'Trade' },
    { path: '/charts', icon: FaChartLine, label: 'Charts & Analysis' },
    { path: '/funding', icon: FaWallet, label: 'Funding' },
    { path: '/history', icon: FaHistory, label: 'Trade History' },
    { path: '/statements', icon: FaFileAlt, label: 'Statements' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-navy-900 min-h-screen shadow-xl">
      <div className="h-full flex flex-col">
        {/* Account Summary */}
        <div className="px-4 py-6 border-b border-navy-800">
          <div className="bg-navy-800 rounded-lg p-4">
            <p className="text-xs text-navy-400 mb-1">Account Balance</p>
            <p className="text-2xl font-bold text-gold-500">$25,450.00</p>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-navy-400">Equity:</span>
              <span className="text-white">$26,780.00</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-navy-400">Free Margin:</span>
              <span className="text-green-500">$24,230.00</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500 text-navy-900 shadow-lg'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-gold-500'
                }`
              }
            >
              <item.icon className="mr-3" size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-6 border-t border-navy-800">
          <button className="w-full flex items-center px-4 py-3 text-navy-200 hover:text-red-500 hover:bg-navy-800 rounded-lg transition-all duration-200">
            <FaSignOutAlt className="mr-3" size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ClientSidebar;