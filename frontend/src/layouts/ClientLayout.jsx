// frontend/src/layouts/ClientLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../components/client/ClientSidebar';
import { FaBell, FaSearch, FaCog } from 'react-icons/fa';
import { HiUserCircle } from 'react-icons/hi2';
import ThemeToggle from '../components/ui/ThemeToggle';

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      {/* Client Header */}
      <header className="bg-white dark:bg-slate-900 shadow-lg fixed w-full z-30 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="px-4 py-3 flex justify-between items-center h-20">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 dark:text-gold-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              TIK TRADES <span className="text-gold-500">Client Portal</span>
            </h1>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" />
              <input
                type="text"
                placeholder="Search markets, instruments..."
                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-gold-500/10 focus:border-gold-500 transition-all font-bold text-xs"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <ThemeToggle />

            <button className="relative p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gold-500 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group">
              <FaBell size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-4 border-white dark:border-slate-900">
                2
              </span>
            </button>
            <button className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gold-500 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <FaCog size={18} />
            </button>
            
            <div className="flex items-center space-x-3 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 pl-1 pr-4">
              <div className="w-10 h-10 bg-slate-900 dark:bg-gold-500 rounded-xl flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-lg">
                J
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">John Smith</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Account: #12345</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed lg:relative lg:block z-20 transition-all duration-300`}>
          <ClientSidebar />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;