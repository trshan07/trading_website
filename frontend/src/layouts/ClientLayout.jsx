// frontend/src/layouts/ClientLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../components/client/ClientSidebar';
import { FaBell, FaUserCircle, FaSearch, FaCog } from 'react-icons/fa';

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Client Header */}
      <header className="bg-navy-900 shadow-lg fixed w-full z-30">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gold-500 hover:text-gold-400 mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">
              Rizal's Trade <span className="text-gold-500">Client Portal</span>
            </h1>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                placeholder="Search markets, instruments..."
                className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative text-navy-200 hover:text-gold-500">
              <FaBell size={20} />
              <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </button>
            <button className="text-navy-200 hover:text-gold-500">
              <FaCog size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <FaUserCircle size={32} className="text-gold-500" />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">John Smith</p>
                <p className="text-xs text-navy-400">Account: #12345</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed lg:relative lg:block z-20`}>
          <ClientSidebar />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;