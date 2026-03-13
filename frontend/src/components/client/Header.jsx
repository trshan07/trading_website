// frontend/src/components/dashboard/Header.jsx
import React from 'react';
import { FaChartLine, FaEye, FaBolt, FaBell, FaSignOutAlt, FaGlobe, FaChartPie, FaUniversity, FaFileAlt } from 'react-icons/fa';

const Header = ({ 
  activeTab, 
  onTabChange, 
  portfolio, 
  showBalance, 
  onToggleBalance, 
  onQuickTrade,
  unreadNotifications,
  user = { name: 'John Smith', tier: 'Premium Trader' }
}) => {
  const tabs = [
    { id: 'trading', label: 'Trading', icon: FaChartLine },
    { id: 'markets', label: 'Markets', icon: FaGlobe },
    { id: 'portfolio', label: 'Portfolio', icon: FaChartPie },
    { id: 'banking', label: 'Banking', icon: FaUniversity },
    { id: 'documents', label: 'Documents', icon: FaFileAlt }
  ];

  return (
    <header className="bg-navy-900/95 backdrop-blur-lg border-b border-gold-500/30 sticky top-0 z-50">
      <div className="px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-navy-950 text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Rizal's<span className="text-gold-500 ml-1">Trade</span>
                </h1>
                <p className="text-xs text-gold-500/70">Professional Trading</p>
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1 bg-navy-800/50 rounded-lg p-1 ml-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gold-500 text-navy-950'
                      : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            <div className="hidden lg:block">
              <p className="text-xs text-gold-500/70">Account Balance</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-bold text-white">
                  {showBalance ? `$${portfolio.totalBalance.toLocaleString()}` : '••••••'}
                </p>
                <button onClick={onToggleBalance}>
                  <FaEye className={`text-gold-500/70 hover:text-gold-500 ${showBalance ? '' : 'opacity-50'}`} />
                </button>
              </div>
            </div>

            {/* Quick Trade Button */}
            <button
              onClick={onQuickTrade}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all"
            >
              <FaBolt />
              <span className="font-medium">Quick Trade</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-gold-500/70 hover:text-gold-500">
                <FaBell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-2 border-l border-gold-500/30">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gold-500/70">{user.tier}</p>
              </div>
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-gold-500/20">
                  <span className="text-navy-950 font-bold text-lg">JS</span>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-navy-800 rounded-lg shadow-xl border border-gold-500/30 hidden group-hover:block">
                  <div className="p-2">
                    <a href="#" className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded">Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded">Settings</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded">Statements</a>
                    <div className="border-t border-gold-500/30 my-2"></div>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-navy-700 rounded flex items-center">
                      <FaSignOutAlt className="mr-2" size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;