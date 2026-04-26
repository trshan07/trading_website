import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import AccountStatementModal from '../../components/ui/AccountStatementModal';

import { AuthContext } from '../../context/AuthContext';
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
  const [marketCategory, setMarketCategory] = useState('All');

  useEffect(() => {
    // Robust tab matching
    const parts = pathname.split('/').filter(Boolean);
    const dashboardIndex = parts.indexOf('dashboard');
    
    if (dashboardIndex !== -1) {
      const tab = parts[dashboardIndex + 1];
      
      if (!tab) {
        setActiveMainTab('trading');
        return;
      }

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
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const handleCategorySelect = (categoryId) => {
    // 1. Map categoryId to Chart Symbol
    const symbolsMap = {
      watchlist: favorites[0] || 'BTCUSDT',
      popular: 'EURUSD',
      forex: 'EURUSD',
      commodities: 'XAUUSD',
      crypto: 'BTCUSDT',
      shares: 'AAPL',
      'indices-cash-1': 'SPX',
      'future-rolling-cfds': 'ES1!',
      'brazilian-index': 'IBOV',
      stocks: 'AAPL',
      funds: 'SPY',
      futures: 'ES1!',
      indices: 'SPX',
      bonds: 'US10Y',
      economy: 'DXY',
      options: 'VIX'
    };

    // 2. Map categoryId to MarketsTab Filter Category
    const categoryNameMap = {
      watchlist: 'Watchlist',
      popular: 'Popular',
      forex: 'Forex',
      commodities: 'Commodities',
      crypto: 'Crypto',
      shares: 'Stocks', 
      'indices-cash-1': 'Indices',
      'future-rolling-cfds': 'Futures',
      'brazilian-index': 'Brazilian Index',
      stocks: 'Stocks',
      funds: 'Funds',
      futures: 'Futures',
      indices: 'Indices',
      bonds: 'Bonds',
      economy: 'Economy',
      options: 'Options'
    };

    const targetSymbol = symbolsMap[categoryId] || 'BTCUSDT';
    const targetCategory = categoryNameMap[categoryId] || 'All';

    setMarketSymbol(targetSymbol);
    setMarketCategory(targetCategory);
    navigate(`/dashboard/markets`);
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
    notifications,
    priceAlerts,
    settings,
    handleAddBankAccount,
    handleDeleteBankAccount,
    handleSetDefaultBankAccount,
    handleAddCreditCard,
    handleDeleteCreditCard,
    handleDeposit,
    handleWithdraw,
    handleTransfer,
    handlePlaceOrder,
    handleUploadDocument,
    handleClosePosition,
    handleCancelOrder,
    handleCreateAlert,
    handleDeleteAlert,
    handleUpdateSettings,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleToggleFavorite,
    handleSetDefaultCreditCard,
    favorites,
    activityLogs,
    instruments,
    categories,
    portfolioHistory,
    platformInfo,
    unreadNotifications: hookUnreadCount
  } = useDashboardData(selectedAccountType);

  const isDemo = selectedAccountType === 'demo';

  const accountBalance = parseFloat(activeAccount?.balance) || 0;
  const accountCredit = parseFloat(activeAccount?.credit) || 0;
  const accountTotalFunds = accountBalance + accountCredit;

  const walletData = {
    mainWallet: accountBalance,
    tradingWallet: 0, // Placeholder if you have separate trading/main wallets
    totalBalance: accountTotalFunds,
    equity: accountTotalFunds,
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

  // Live Portfolio Calculation (Real-time P&L)
  const livePortfolio = useMemo(() => {
    if (!user || !activeAccount) return portfolio;
    
    let totalUnrealizedPnL = 0;
    let totalMargin = 0;
    
    positions.forEach(pos => {
      const livePrice = marketData[pos.symbol]?.price || pos.currentPrice || pos.entryPrice;
      const amount = pos.quantity;
      const entryPrice = pos.entryPrice;
      const side = pos.type; // BUY or SELL
      
      const pnl = side === 'BUY' 
        ? (livePrice - entryPrice) * amount
        : (entryPrice - livePrice) * amount;
      
      totalUnrealizedPnL += pnl;
      totalMargin += pos.margin;
    });
    
    const balance = parseFloat(activeAccount.balance) || 0;
    const credit = parseFloat(activeAccount.credit) || 0;
    const totalFunds = balance + credit;
    const equity = totalFunds + totalUnrealizedPnL;
    const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : 0;
    
    return {
      ...portfolio,
      totalBalance: totalFunds,
      availableBalance: totalFunds - totalMargin,
      freeMargin: equity - totalMargin,
      equity: equity,
      margin: totalMargin,
      marginLevel: marginLevel,
      dailyPnL: totalUnrealizedPnL,
      positionsCount: positions.length,
      credit,
      leverage: activeAccount.leverage || 100
    };
  }, [user, activeAccount, positions, marketData, portfolio]);

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
          navigate(`/dashboard/${tab}`);
          setShowMobileMenu(false);
        }}
        user={user}
        portfolio={livePortfolio}
        showBalance={showBalance}
        onLogout={handleLogout}
        onShowStatement={() => setShowStatementModal(true)}
      />

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          portfolio={livePortfolio}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
          onQuickTrade={() => setShowOrderForm(true)}
          unreadNotifications={hookUnreadCount}
          notifications={notifications}
          instruments={instruments}
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
          onShowStatement={() => setShowStatementModal(true)}
        />

        {/* Fixed Price Ticker */}
        <PriceTicker data={marketData} />

        {/* Scrollable Region */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-[var(--bg-primary)]">
          <main className="px-2 sm:px-6 md:px-10 py-4 md:py-10 max-w-[1600px] mx-auto w-full">
            {/* Demo Mode Banner */}
            {isDemo && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-amber-500/20">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-500 text-slate-900 rounded-2xl animate-pulse shadow-lg shadow-amber-500/20 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1.5">Simulated Practice Mode Active</p>
                    <p className="text-[11px] sm:text-sm font-medium text-slate-400 leading-relaxed">You are currently operating with simulated funds ($1,000.00 Grant). Real profits/losses are not applicable.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveMainTab('settings')} 
                  className="w-full md:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform border border-slate-100 dark:border-slate-700 shadow-xl"
                >
                  Apply for Real Account
                </button>
              </div>
            )}

            {/* Content Logic */}
            <div className="transition-all duration-300">
              {activeMainTab === 'trading' && (
                <TradingTab
                  portfolio={livePortfolio}
                  showBalance={showBalance}
                  onToggleBalance={() => setShowBalance(!showBalance)}
                  positions={positions}
                  orders={orders}
                  marketData={marketData}
                  portfolioHistory={portfolioHistory}
                  onPlaceOrder={handlePlaceOrder}
                  onClosePosition={handleClosePosition}
                  onCancelOrder={handleCancelOrder}
                  activeSymbol={marketSymbol}
                  onSymbolChange={(sym) => setMarketSymbol(sym)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onDeleteAlert={handleDeleteAlert}
                  transactions={transactions}
                  instruments={instruments}
                  categories={categories}
                  maxLeverage={parseInt(activeAccount?.leverage, 10) || 100}
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
                  platformInfo={platformInfo}
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
                  initialCategory={marketCategory}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  instruments={instruments}
                  categories={categories}
                />
              )}

              {activeMainTab === 'portfolio' && (
                <PortfolioTab
                  portfolio={livePortfolio}
                  portfolioHistory={portfolioHistory}
                  positions={positions}
                  activityLogs={activityLogs}
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
            setActiveMainTab={(tab) => {
              navigate(`/dashboard/${tab}`);
              setShowMobileMenu(false);
            }}
            user={user}
            portfolio={livePortfolio}
            showBalance={showBalance}
            onLogout={handleLogout}
            onSwitchAccount={switchAccountType}
            onShowStatement={() => setShowStatementModal(true)}
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
      <AccountStatementModal 
        show={showStatementModal} 
        onClose={() => setShowStatementModal(false)}
        transactions={transactions}
        accountLabel={`${(activeAccount?.account_type || activeAccount?.type || selectedAccountType || 'account').toUpperCase()} ${activeAccount?.account_number || ''}`.trim()}
        customerName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
      />
    </div>
  );
};

export default DashboardPage;
