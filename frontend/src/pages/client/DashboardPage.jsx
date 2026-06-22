import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AccountStatementModal from '../../components/ui/AccountStatementModal';
import UploadDocumentModal from '../../components/ui/UploadDocumentModal';
import TransferModal from '../../components/ui/TransferModal';
import DepositFundsModal from '../../components/client/banking/DepositFundsModal';
import WithdrawalFundsModal from '../../components/client/banking/WithdrawalFundsModal';
import BankingZoneTab from '../../components/client/BankingZoneTab';
import Header from '../../components/client/Header';
import MobileBottomNav from '../../components/client/MobileBottomNav';
import MobileSidebar from '../../components/client/MobileSidebar';
import MyAccountTab from '../../components/client/MyAccountTab';
import SettingsTab from '../../components/client/SettingsTab';
import TradingTab from '../../components/client/TradingTab';
import VerificationCenterTab from '../../components/client/VerificationCenterTab';
import { AuthContext } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';

const normalizeLeverage = (value, fallback = 100) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  const raw = String(value ?? '').trim();
  if (!raw) {
    return fallback;
  }

  if (raw.includes(':')) {
    const [, rhs] = raw.split(':');
    const parsedRatio = Number.parseFloat(rhs);
    return Number.isFinite(parsedRatio) && parsedRatio > 0 ? parsedRatio : fallback;
  }

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const routeToTabMap = {
  trading: 'webtrader',
  webtrader: 'webtrader',
  account: 'account',
  portfolio: 'account',
  banking: 'banking',
  funding: 'banking',
  deposit: 'banking',
  withdrawal: 'banking',
  verification: 'verification',
  documents: 'verification',
  settings: 'settings',
};

const DashboardPage = () => {
  const { user, logout, loading: authLoading, selectedAccountType, switchAccountType } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('webtrader');
  const [marketSymbol, setMarketSymbol] = useState('BTCUSDT');
  const [showBalance] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const activeAccount = user?.accounts?.find((account) => {
    const type = (account.account_type || account.type || '').toLowerCase();
    const targetType = (selectedAccountType || 'demo').toLowerCase();

    if (targetType === 'real' || targetType === 'live') {
      return type === 'real' || type === 'live';
    }

    return type === targetType;
  }) || user?.accounts?.[0] || {
    id: null,
    balance: 0,
    credit: 0,
    leverage: 100,
    account_number: 'N/A',
  };

  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean);
    const dashboardIndex = parts.indexOf('dashboard');
    const routeKey = dashboardIndex !== -1 ? parts[dashboardIndex + 1] : null;
    const nextTab = routeToTabMap[routeKey] || 'webtrader';
    setActiveMainTab(nextTab);
  }, [pathname]);

  const {
    bankAccounts,
    creditCards,
    transactions,
    documents,
    positions,
    orders,
    closedTrades,
    accountRisk,
    marketData,
    notifications,
    priceAlerts,
    platformInfo,
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
    handleModifyPosition,
    handleCancelOrder,
    handleModifyOrder,
    handleCreateAlert,
    handleDeleteAlert,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleToggleFavorite,
    handleSetDefaultCreditCard,
    favorites,
    activityLogs,
    instruments,
    categories,
    portfolioHistory,
    unreadNotifications,
  } = useDashboardData(selectedAccountType, marketSymbol, {
    shouldPollTrading: Boolean(activeAccount?.id),
  });

  const livePortfolio = useMemo(() => {
    const balance = Number.parseFloat(activeAccount?.balance) || 0;
    const credit = Number.parseFloat(activeAccount?.credit) || 0;
    const totalFunds = balance + credit;
    const backendRisk = accountRisk?.risk || null;
    const totalUnrealizedPnL = positions.reduce((sum, position) => sum + (Number.parseFloat(position.pnl) || 0), 0);
    const totalMargin = positions.reduce((sum, position) => sum + (Number.parseFloat(position.margin) || 0), 0);
    const equity = totalFunds + totalUnrealizedPnL;
    const freeMargin = equity - totalMargin;
    const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : 0;

    return {
      totalBalance: totalFunds,
      cashBalance: balance,
      availableBalance: freeMargin,
      freeMargin,
      equity,
      margin: totalMargin,
      marginLevel,
      dailyPnL: totalUnrealizedPnL,
      positionsCount: positions.length,
      credit,
      leverage: activeAccount?.leverage || 100,
      marginCall: Boolean(backendRisk?.marginCall),
      stopOut: Boolean(backendRisk?.stopOut),
    };
  }, [accountRisk, activeAccount, positions]);

  const walletData = useMemo(() => {
    const pendingWithdrawals = transactions.reduce((sum, transaction) => (
      transaction.status === 'Pending' && transaction.type === 'Withdrawal'
        ? sum + (Number.parseFloat(transaction.amount) || 0)
        : sum
    ), 0);

    const pendingDeposits = transactions.reduce((sum, transaction) => (
      transaction.status === 'Pending' && transaction.type === 'Deposit'
        ? sum + (Number.parseFloat(transaction.amount) || 0)
        : sum
    ), 0);

    return {
      mainWallet: livePortfolio.cashBalance,
      tradingWallet: livePortfolio.margin,
      totalBalance: livePortfolio.totalBalance,
      equity: livePortfolio.equity,
      bonusWallet: livePortfolio.credit,
      pendingWithdrawals,
      pendingDeposits,
    };
  }, [livePortfolio, transactions]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeMainTab = (tab) => {
    const normalized = tab || 'webtrader';
    setActiveMainTab(normalized);
    setShowMobileMenu(false);
    navigate(normalized === 'webtrader' ? '/dashboard' : `/dashboard/${normalized}`);
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-slate-900 transition-colors dark:text-white">
      <Header
        portfolio={livePortfolio}
        showBalance={showBalance}
        onDepositFunds={() => setShowDepositModal(true)}
        onWithdrawFunds={() => setShowWithdrawalModal(true)}
        unreadNotifications={unreadNotifications}
        notifications={notifications}
        instruments={instruments}
        marketData={marketData}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setShowMobileMenu(true)}
        isDemo={selectedAccountType === 'demo'}
        onSwitchAccount={switchAccountType}
        onSelectSymbol={(symbol) => {
          setMarketSymbol(symbol);
          changeMainTab('webtrader');
        }}
        onShowStatement={() => setShowStatementModal(true)}
      />

      <main className="mx-auto max-w-[1800px] px-3 py-4 pb-24 sm:px-5 lg:px-6 lg:pb-8">
        {selectedAccountType === 'demo' && activeMainTab === 'webtrader' && (
          <div className="mb-4 rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
            Demo mode is active. Trades, balances, and requests are simulated until you switch to a live account.
          </div>
        )}

        {activeMainTab === 'webtrader' && (
          <TradingTab
            accountId={activeAccount?.id}
            portfolio={livePortfolio}
            positions={positions}
            orders={orders}
            closedTrades={closedTrades}
            marketData={marketData}
            portfolioHistory={portfolioHistory}
            onPlaceOrder={handlePlaceOrder}
            onClosePosition={handleClosePosition}
            onModifyPosition={handleModifyPosition}
            onCancelOrder={handleCancelOrder}
            onModifyOrder={handleModifyOrder}
            activeSymbol={marketSymbol}
            onSymbolChange={setMarketSymbol}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            transactions={transactions}
            instruments={instruments}
            categories={categories}
            priceAlerts={priceAlerts}
            onCreateAlert={handleCreateAlert}
            onDeleteAlert={handleDeleteAlert}
            maxLeverage={normalizeLeverage(activeAccount?.leverage, 100)}
          />
        )}

        {activeMainTab === 'account' && (
          <MyAccountTab
            accountId={activeAccount?.id}
          />
        )}

        {activeMainTab === 'banking' && (
          <BankingZoneTab
            walletData={walletData}
            bankAccounts={bankAccounts}
            creditCards={creditCards}
            transactions={transactions}
            onTransfer={() => setShowTransferModal(true)}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onAddBankAccount={handleAddBankAccount}
            onDeleteBankAccount={handleDeleteBankAccount}
            onSetDefaultBankAccount={handleSetDefaultBankAccount}
            onAddCreditCard={handleAddCreditCard}
            onDeleteCreditCard={handleDeleteCreditCard}
            onSetDefaultCreditCard={handleSetDefaultCreditCard}
            platformInfo={platformInfo}
            isDemo={selectedAccountType === 'demo'}
          />
        )}

        {activeMainTab === 'verification' && (
          <VerificationCenterTab
            documents={documents}
            onUpload={handleUploadDocument}
          />
        )}

        {activeMainTab === 'settings' && <SettingsTab />}
      </main>

      <DepositFundsModal
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
        platformInfo={platformInfo}
      />

      <WithdrawalFundsModal
        open={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onWithdraw={handleWithdraw}
        walletBalance={walletData.mainWallet}
        isDemo={selectedAccountType === 'demo'}
      />

      <MobileSidebar
        show={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        activeMainTab={activeMainTab}
        setActiveMainTab={changeMainTab}
        user={user}
        onLogout={handleLogout}
      />

      <TransferModal
        show={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={handleTransfer}
        walletData={walletData}
        accounts={user?.accounts || []}
      />

      <UploadDocumentModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadDocument}
      />

      <MobileBottomNav
        activeTab={activeMainTab}
        onTabChange={changeMainTab}
      />

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
