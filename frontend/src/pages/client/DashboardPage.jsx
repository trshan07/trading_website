// frontend/src/pages/client/DashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBolt, FaChartLine, FaTimes, FaBars, FaBell, 
  FaUser, FaSignOutAlt, FaCog, FaSearch, FaFilter,
  FaArrowUp, FaArrowDown, FaWallet, FaExchangeAlt,
  FaFileAlt, FaChartBar, FaDatabase, FaHistory,
  FaSun, FaDownload
} from 'react-icons/fa';

// Import dashboard components
import Sidebar from '../../components/client/Sidebar';
import Header from '../../components/client/Header';
import TradingTab from '../../components/client/TradingTab';
import BankingTab from '../../components/client/BankingTab';
import DocumentsTab from '../../components/client/DocumentsTab';
import MarketsTab from '../../components/client/MarketsTab';
import PortfolioTab from '../../components/client/PortfolioTab';
import PriceTicker from '../../components/trading/PriceTicker';
import WelcomeHeader from '../../components/ui/WelcomeHeader';
import { AuthContext } from '../../context/AuthContext';
import RealTimeChart from '../../components/trading/RealTimeChart';

const DashboardPage = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('trading');
  const [showBalance, setShowBalance] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Find the selected account based on the session
  const activeAccount = user?.accounts?.find(acc => acc.type === user?.selectedAccountType) || {
    balance: 0,
    type: user?.selectedAccountType || 'demo',
    account_number: 'N/A'
  };

  // Dynamic Portfolio Data
  const [portfolio, setPortfolio] = useState({
    totalBalance: activeAccount.balance,
    availableBalance: activeAccount.balance,
    equity: activeAccount.balance,
    margin: 0,
    marginLevel: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    weeklyPnL: 0,
    monthlyPnL: 0,
    yearlyPnL: 0,
    positionsCount: 0
  });

  const [walletData, setWalletData] = useState({
    mainWallet: activeAccount.balance,
    tradingWallet: activeAccount.balance,
    totalBalance: activeAccount.balance
  });

  useEffect(() => {
    if (user && activeAccount) {
      setPortfolio(prev => ({
        ...prev,
        totalBalance: activeAccount.balance,
        availableBalance: activeAccount.balance,
        equity: activeAccount.balance,
      }));
      setWalletData(prev => ({
        ...prev,
        mainWallet: activeAccount.balance,
        tradingWallet: activeAccount.balance,
        totalBalance: activeAccount.balance,
      }));
    }
  }, [user?.id, activeAccount.balance]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Data mocks (staying consistent with previous state)
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bankName: 'Chase Bank', accountNumber: '****1234', accountName: 'John Smith', isVerified: true, isDefault: true, balance: 25000.00 },
    { id: 2, bankName: 'Bank of America', accountNumber: '****5678', accountName: 'John Smith', isVerified: true, isDefault: false, balance: 15000.00 }
  ]);

  const [creditCards, setCreditCards] = useState([
    { id: 1, cardType: 'Visa', last4: '4242', expiryDate: '05/26', cardholderName: 'John Smith', isVerified: true, isDefault: true },
    { id: 2, cardType: 'Mastercard', last4: '8888', expiryDate: '08/25', cardholderName: 'John Smith', isVerified: true, isDefault: false }
  ]);

  const [transactions] = useState([
    { id: 1, type: 'Deposit', amount: 5000, method: 'Bank Transfer', status: 'Completed', date: '2024-03-07 10:30 AM', reference: 'DEP-2024-001' },
    { id: 2, type: 'Withdrawal', amount: 1000, method: 'Credit Card', status: 'Pending', date: '2024-03-06 02:15 PM', reference: 'WDR-2024-002' }
  ]);

  const [documents, setDocuments] = useState([
    { id: 1, name: 'Passport.pdf', uploadDate: '2024-03-01', category: 'Identity Proof', status: 'Verified' },
    { id: 2, name: 'Bank_Statement.pdf', uploadDate: '2024-03-01', category: 'Address Proof', status: 'Verified' }
  ]);

  const [positions, setPositions] = useState([
    { id: 1, symbol: 'BTC/USD', type: 'LONG', quantity: 0.5, entryPrice: 42500, currentPrice: 43250, pnl: 375, margin: 2125 },
    { id: 2, symbol: 'ETH/USD', type: 'SHORT', quantity: 5, entryPrice: 2850, currentPrice: 2820, pnl: 150, margin: 1425 }
  ]);

  const [orders, setOrders] = useState([
    { id: 1, symbol: 'BTC/USD', type: 'LIMIT', side: 'BUY', quantity: 0.1, price: 42000, status: 'OPEN' }
  ]);

  const [marketData, setMarketData] = useState({
    'BTC/USD': { price: 43250, change: 2.5, volume: 1520000000 },
    'ETH/USD': { price: 2820, change: 1.8, volume: 850000000 },
    'EUR/USD': { price: 1.0875, change: 0.23, volume: 1200000000 }
  });

  const portfolioHistory = [
    { date: '2024-03-01', value: 50200 },
    { date: '2024-03-07', value: 53450 }
  ];

  const [notifications] = useState([
    { id: 1, message: 'BTC/USD reached resistance level', type: 'info', read: false },
    { id: 3, message: 'Deposit confirmed: $5,000', type: 'success', read: true }
  ]);

  const mobileNavItems = [
    { id: 'trading', label: 'Trading', icon: FaChartLine },
    { id: 'banking', label: 'Banking', icon: FaWallet },
    { id: 'documents', label: 'Documents', icon: FaFileAlt },
    { id: 'markets', label: 'Markets', icon: FaChartBar },
    { id: 'portfolio', label: 'Portfolio', icon: FaDatabase },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (windowWidth >= 1024) setShowMobileMenu(false);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [windowWidth]);

  // Real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          newData[key].price *= (1 + (Math.random() - 0.5) * 0.001);
          newData[key].change += (Math.random() - 0.5) * 0.1;
        });
        return newData;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePlaceOrder = () => setShowOrderForm(false);
  const handleClosePosition = (id) => setPositions(p => p.filter(pos => pos.id !== id));
  const handleCancelOrder = (id) => setOrders(o => o.filter(ord => ord.id !== id));

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const isMobile = windowWidth < 768;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Permanent Sidebar (Desktop) */}
      <Sidebar 
        activeTab={activeMainTab}
        onTabChange={(tab) => {
          setActiveMainTab(tab);
          setShowMobileMenu(false);
        }}
        user={user}
        portfolio={portfolio}
        showBalance={showBalance}
        onLogout={handleLogout}
      />

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          portfolio={portfolio}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
          onQuickTrade={() => setShowOrderForm(true)}
          unreadNotifications={unreadNotifications}
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setShowMobileMenu(true)}
        />

        {/* Scrollable Region */}
        <div className="flex-1 overflow-y-auto relative">
          <PriceTicker data={marketData} />

          <main className="px-4 md:px-10 py-10 max-w-[1600px] mx-auto w-full">
            <WelcomeHeader 
              user={user}
              portfolio={portfolio}
              onDeposit={() => setActiveMainTab('banking')}
              onTrade={() => setActiveMainTab('trading')}
            />

            {/* Content Logic */}
            <div className="transition-all duration-300">
              {activeMainTab === 'trading' && (
                <TradingTab 
                  portfolio={portfolio}
                  showBalance={showBalance}
                  onToggleBalance={() => setShowBalance(!showBalance)}
                  positions={positions}
                  orders={orders}
                  marketData={marketData}
                  portfolioHistory={portfolioHistory}
                  onPlaceOrder={handlePlaceOrder}
                  onClosePosition={handleClosePosition}
                  onCancelOrder={handleCancelOrder}
                />
              )}

              {activeMainTab === 'banking' && (
                <BankingTab 
                  walletData={walletData}
                  bankAccounts={bankAccounts}
                  creditCards={creditCards}
                  transactions={transactions}
                  onTransfer={() => setShowTransferModal(true)}
                />
              )}

              {activeMainTab === 'documents' && (
                <DocumentsTab 
                  documents={documents}
                  onUpload={() => setShowUploadModal(true)}
                />
              )}

              {activeMainTab === 'markets' && <MarketsTab />}

              {activeMainTab === 'portfolio' && (
                <PortfolioTab 
                  portfolio={portfolio} 
                  portfolioHistory={portfolioHistory} 
                  positions={positions} 
                />
              )}
            </div>
          </main>

          {/* Quick Trade Modal */}
          {showOrderForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowOrderForm(false)}></div>
              <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-xl font-black text-slate-900 uppercase italic">Execution</h2>
                  <button onClick={() => setShowOrderForm(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><FaTimes /></button>
                </div>
                <div className="p-10 text-center">
                  <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-900/30">
                    <FaBolt className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tight mb-2">Instant Trade</h3>
                  <p className="text-slate-400 font-medium text-sm mb-8">Execute trades instantly with zero latency at current market rates.</p>
                  <button onClick={handlePlaceOrder} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-gold-600 transition-all shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1">Initialize Terminal Flow</button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Drawer */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-[100] flex lg:hidden">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowMobileMenu(false)}></div>
              <div className="relative w-80 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-2xl font-black italic tracking-tighter">RIZAL<span className="text-gold-500">.</span></h2>
                  <button onClick={() => setShowMobileMenu(false)} className="p-2"><FaTimes /></button>
                </div>
                <div className="flex-1 p-4 space-y-1">
                  {mobileNavItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveMainTab(item.id); setShowMobileMenu(false); }}
                      className={`w-full px-6 py-4 rounded-2xl flex items-center space-x-4 ${activeMainTab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}
                    >
                      <item.icon />
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default DashboardPage;
