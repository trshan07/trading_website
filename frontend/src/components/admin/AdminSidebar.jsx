// frontend/src/components/admin/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaFileAlt,
  FaCog,
  FaHistory,
  FaShieldAlt,
  FaExchangeAlt,
  FaSignOutAlt,
  FaUserCheck,
  FaWallet
  
} from 'react-icons/fa';

const AdminSidebar = () => {
  const menuItems = [
  { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/admin/users', icon: FaUsers, label: 'User Management' },
  { path: '/admin/kyc', icon: FaUserCheck, label: 'KYC Verification' },
  { path: '/admin/transactions', icon: FaMoneyBillWave, label: 'Transactions' },
  { path: '/admin/funding', icon: FaWallet, label: 'Funding Requests' },
  { path: '/admin/trades', icon: FaExchangeAlt, label: 'Trade Oversight' },
  { path: '/admin/reports', icon: FaFileAlt, label: 'Reports' },
  { path: '/admin/audit', icon: FaHistory, label: 'Audit Logs' },
  { path: '/admin/settings', icon: FaCog, label: 'System Settings' },
  ];

  return (
    <aside className="w-64 bg-navy-900 min-h-screen shadow-xl">
      <div className="h-full flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
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
              
              {/* Notification badge example */}
              {item.label === 'Funding Requests' && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  5
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Status */}
        <div className="px-4 py-6 border-t border-navy-800">
          <div className="bg-navy-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-navy-400">System Status</span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                <span className="text-xs text-green-500">Online</span>
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-navy-400">CPU Usage</span>
                <span className="text-white">45%</span>
              </div>
              <div className="w-full bg-navy-900 rounded-full h-1.5">
                <div className="bg-gold-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-navy-400">Memory</span>
                <span className="text-white">62%</span>
              </div>
              <div className="w-full bg-navy-900 rounded-full h-1.5">
                <div className="bg-gold-500 h-1.5 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button className="w-full mt-4 flex items-center px-4 py-3 text-navy-200 hover:text-red-500 hover:bg-navy-800 rounded-lg transition-all duration-200">
            <FaSignOutAlt className="mr-3" size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;