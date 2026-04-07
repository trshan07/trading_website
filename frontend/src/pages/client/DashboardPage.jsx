import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import Custom Hooks
import { useDashboardData } from '../../hooks/useDashboardData';

// Import Dashboard Components
import Sidebar from '../../components/client/Sidebar';
import Header from '../../components/client/Header';
import TradingTab from '../../components/client/TradingTab';
import BankingTab from '../../components/client/BankingTab';
import DocumentsTab from '../../components/client/DocumentsTab';
import SettingsTab from '../../components/client/SettingsTab';
import MarketsTab from '../../components/client/MarketsTab';
import PortfolioTab from '../../components/client/PortfolioTab';
import PriceTicker from '../../components/trading/PriceTicker';
import WelcomeHeader from '../../components/ui/WelcomeHeader';
import { AuthContext } from '../../context/AuthContext';

// Import newly added components
import QuickTradeModal from '../../components/trading/QuickTradeModal';
import QuickCategories from '../../components/client/QuickCategories';
import MobileSidebar from '../../components/client/MobileSidebar';
import TransferModal from '../../components/ui/TransferModal';
import UploadDocumentModal from '../../components/ui/UploadDocumentModal';

const DashboardPage = () => {
  const { user, logout, loading: authLoading, selectedAccountType, switchAccountType } = useContext(AuthContext);
  const navigate = useNavigate();

  // Find the selected account based on the session
  const activeAccount = user?.accounts?.find(acc => {
    const type = acc.account_type || acc.type || '';
    return type.toLowerCase() === (selectedAccountType || 'demo').toLowerCase();
  }) || {
    id: user?.accounts?.[0]?.id || 'dummy', // Try to get an ID if possible
    balance: 0,
    type: selectedAccountType || 'demo',
    account_number: 'N/A'
  };

  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('trading');
  const [marketSymbol, setMarketSymbol] = useState('BTCUSDT');

  useEffect(() => {
    const tabMatch = pathname.match(/\/dashboard\/([a-z-]+)/);
    if (tabMatch && tabMatch[1]) {
      const tab = tabMatch[1];
      // Map some URL paths to tab IDs if they differ
      const tabMap = {
        'funding': 'banking',
        'deposit': 'banking',
        'withdrawal': 'banking',
        'history': 'banking',
        'profile': 'settings',
        'statements': 'documents'
      };
      setActiveMainTab(tabMap[tab] || tab);
    }
  }, [pathname]);
  const [showBalance, setShowBalance] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const handleCategorySelect = (categoryId) => {
    if (categoryId === 'markets') {
      setActiveMainTab('markets');
      return;
    }
    const symbolsMap = {
      stocks: 'AAPL',
      funds: 'SPY',
      futures: 'ES1!',
      forex: 'EURUSD',
      crypto: 'BTCUSDT',
      indices: 'SPX',
      bonds: 'US10Y',
      economy: 'DXY',
      options: 'VIX'
    };
    setMarketSymbol(symbolsMap[categoryId] || 'BTCUSDT');
    setActiveMainTab('markets');
  };

  // Fetch all mock state from custom hook
  const {
    bankAccounts,
    creditCards,
    transactions,
    documents,
    positions,
    orders,
    marketData,
    portfolioHistory,
    notifications,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleAddBankAccount,
    handleDeleteBankAccount,
    handleSetDefaultBankAccount,
    handleAddCreditCard,
    handleDeleteCreditCard,
    handleSetDefaultCreditCard,
    handleDeposit,
    handleWithdraw,
    handleTransfer,
    handlePlaceOrder,
    handleUploadDocument,
    handleClosePosition,
    handleCancelOrder
  } = useDashboardData(selectedAccountType);

  const isDemo = selectedAccountType === 'demo';

  const walletData = {
    mainWallet: activeAccount?.balance || 0,
    tradingWallet: 0, // Placeholder if you have separate trading/main wallets
    totalBalance: activeAccount?.balance || 0,
    equity: activeAccount?.balance || 0,
  };


  // Dynamic Portfolio Data
  const [portfolio, setPortfolio] = useState({
    totalBalance: 0,
    availableBalance: 0,
    equity: 0,
    margin: 0,
    marginLevel: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    weeklyPnL: 0,
    monthlyPnL: 0,
    yearlyPnL: 0,
    positionsCount: 0
  });

  useEffect(() => {
    if (user && activeAccount) {
      // Calculate total unrealized P&L from active positions
      const totalUnrealizedPnL = positions?.reduce((sum, pos) => sum + (parseFloat(pos.pnl) || 0), 0) || 0;
      const totalMargin = positions?.reduce((sum, pos) => sum + (parseFloat(pos.margin) || 0), 0) || 0;
      
      const balance = parseFloat(activeAccount.balance) || 0;
      const equity = balance + totalUnrealizedPnL;
      const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : 0;

      setPortfolio(prev => ({
        ...prev,
        totalBalance: balance,
        availableBalance: balance - totalMargin, // Available to withdraw/trade
        equity: equity,
        margin: totalMargin,
        marginLevel: marginLevel,
        dailyPnL: totalUnrealizedPnL,
        positionsCount: positions?.length || 0
      }));
    }
  }, [user, activeAccount, positions]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  const onOrderPlaced = (order) => {
    handlePlaceOrder(order);
    setShowOrderForm(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex overflow-hidden font-sans transition-colors duration-300">
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
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setShowMobileMenu(true)}
          isDemo={isDemo}
          onSwitchAccount={switchAccountType}
          onSelectSymbol={(symbol) => {
            setMarketSymbol(symbol);
            setActiveMainTab('markets');
          }}
        />

        {/* Fixed Price Ticker */}
        <PriceTicker data={marketData} />

        {/* Scrollable Region */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <main className="px-4 md:px-10 py-10 max-w-[1600px] mx-auto w-full">
            {/* Demo Mode Banner */}
            {isDemo && (
              <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:bg-amber-500/20">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-500 text-slate-900 rounded-2xl animate-pulse shadow-lg shadow-amber-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Simulated Practice Mode Active</p>
                    <p className="text-sm font-medium text-slate-400">You are currently operating with simulated funds ($1,000.00 Grant). Real profits/losses are not applicable.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveMainTab('settings')} 
                  className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform border border-slate-100 dark:border-slate-700 shadow-xl"
                >
                  Apply for Real Account
                </button>
              </div>
            )}

            <WelcomeHeader
              user={user}
              portfolio={portfolio}
              onDeposit={() => setActiveMainTab('banking')}
              onTrade={() => setActiveMainTab('trading')}
            />

            <QuickCategories onSelectCategory={handleCategorySelect} />

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
                  onShowTransferModal={() => setShowTransferModal(true)}
                  onDeposit={handleDeposit}
                  onWithdraw={handleWithdraw}
                  onAddBankAccount={handleAddBankAccount}
                  onDeleteBankAccount={handleDeleteBankAccount}
                  onSetDefaultBankAccount={handleSetDefaultBankAccount}
                  onAddCreditCard={handleAddCreditCard}
                  onDeleteCreditCard={handleDeleteCreditCard}
                  onSetDefaultCreditCard={handleSetDefaultCreditCard}
                  isDemo={isDemo}
                />
              )}

              {activeMainTab === 'documents' && (
                <DocumentsTab
                  documents={documents}
                  onUpload={() => setShowUploadModal(true)}
                  onUploadFile={handleUploadDocument}
                />
              )}

              {activeMainTab === 'markets' && (
                <MarketsTab
                  symbol={marketSymbol}
                  onSymbolChange={(sym) => setMarketSymbol(sym)}
                />
              )}

              {activeMainTab === 'portfolio' && (
                <PortfolioTab
                  portfolio={portfolio}
                  portfolioHistory={portfolioHistory}
                  positions={positions}
                />
              )}

              {activeMainTab === 'settings' && <SettingsTab />}
            </div>
          </main>

          {/* Extracted Components */}
          <QuickTradeModal
            show={showOrderForm}
            onClose={() => setShowOrderForm(false)}
            onPlaceOrder={onOrderPlaced}
          />

          <MobileSidebar
            show={showMobileMenu}
            onClose={() => setShowMobileMenu(false)}
            activeMainTab={activeMainTab}
            setActiveMainTab={setActiveMainTab}
            user={user}
            portfolio={portfolio}
            showBalance={showBalance}
            onLogout={handleLogout}
            onSwitchAccount={switchAccountType}
          />

          {/* Functional Modals */}
          <TransferModal
            show={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            onTransfer={handleTransfer}
            walletData={walletData}
          />

          <UploadDocumentModal
            show={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUploadDocument}
          />

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
