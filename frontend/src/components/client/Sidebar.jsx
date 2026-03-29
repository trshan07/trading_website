// frontend/src/components/client/Sidebar.jsx
import React from 'react';
import { 
  FaChartLine, FaGlobe, FaChartPie, FaUniversity, 
  FaFileAlt, FaCog, FaSignOutAlt, FaShieldAlt,
  FaArrowUp, FaArrowDown, FaPlus
} from 'react-icons/fa';

const Sidebar = ({ activeTab, onTabChange, onLogout, user, portfolio, showBalance }) => {
  const menuItems = [
    { id: 'trading', label: 'Trading', icon: FaChartLine },
    { id: 'markets', label: 'Markets', icon: FaGlobe },
    { id: 'portfolio', label: 'Portfolio', icon: FaChartPie },
    { id: 'banking', label: 'Banking', icon: FaUniversity },
    { id: 'documents', label: 'Documents', icon: FaFileAlt },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-slate-200 hidden lg:flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-8 pb-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 group-hover:bg-gold-500 transition-all duration-500 transform group-hover:rotate-[15deg]">
            <FaChartLine className="text-white text-2xl group-hover:text-gold-500 transition-colors" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Rizal<span className="text-gold-500">.</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Terminal Prime</p>
          </div>
        </div>
      </div>

      {/* Account Snapshot Card - Glassmorphism */}
      <div className="px-6 mb-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-900/30 overflow-hidden relative">
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Equity</p>
                <h3 className="text-2xl font-black text-white italic tracking-tight">
                  {showBalance ? `$${(portfolio?.equity ?? 0).toLocaleString()}` : '••••••'}
                </h3>
              </div>
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/5">
                <FaShieldAlt className="text-gold-400" size={12} />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
               <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Free Margin</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {showBalance ? `$${(portfolio?.availableBalance ?? 0).toLocaleString()}` : '••••'}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Performance</p>
                  <div className="flex items-center text-emerald-400 text-xs font-bold mt-0.5">
                    <FaArrowUp className="mr-1" size={8} /> +6.5%
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full group px-5 py-4 rounded-[1.25rem] flex items-center transition-all duration-300 relative ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl border transition-all duration-300 mr-4 ${
                isActive ? 'bg-gold-500 border-gold-400' : 'bg-white border-slate-100 group-hover:border-slate-300'
              }`}>
                <item.icon size={12} className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-900'} />
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-6 w-1.5 h-1.5 bg-gold-400 rounded-full shadow-[0_0_10px_#D4AF37]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-6">
        <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-100/50 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-gold-500 font-black italic shadow-lg group-hover:scale-110 transition-transform">
               {user?.firstName?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 tracking-tight uppercase">{user?.firstName} {user?.lastName}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{user?.selectedAccountType} account</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            <FaSignOutAlt size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
