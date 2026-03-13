// frontend/src/pages/client/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { FaBolt, FaChartLine, FaTimes } from 'react-icons/fa';

// Import dashboard components
import Header from '../../components/client/Header';
import TradingTab from '../../components/client/TradingTab';
import BankingTab from '../../components/client/BankingTab';
import DocumentsTab from '../../components/client/DocumentsTab';
import TransferModal from '../../components/client/TransferModal';
import UploadModal from '../../components/client/UploadModal';
import PriceTicker from '../../components/trading/PriceTicker';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('trading');
  const [showBalance, setShowBalance] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Portfolio Data
  const [portfolio, setPortfolio] = useState({
    totalBalance: 52450.75,
    availableBalance: 50000.25,
    equity: 53450.25,
    margin: 2450.5,
    marginLevel: 218,
    dailyPnL: 1250.5,
    dailyPnLPercent: 2.41,
    weeklyPnL: 4250.75,
    monthlyPnL: 18750.25,
    yearlyPnL: 245000.5,
    positionsCount: 3
  });

  // Wallet Data
  const [walletData, setWalletData] = useState({
    mainWallet: 52450.75,
    tradingWallet: 50000.25,
    bonusWallet: 2500.00,
    creditWallet: 5000.00,
    totalBalance: 59950.75,
    pendingWithdrawals: 1500.00,
    pendingDeposits: 2000.00
  });

  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 1,
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      accountName: 'John Smith',
      routingNumber: '021000021',
      accountType: 'Checking',
      isVerified: true,
      isDefault: true,
      balance: 25000.00
    },
    {
      id: 2,
      bankName: 'Bank of America',
      accountNumber: '****5678',
      accountName: 'John Smith',
      routingNumber: '026009593',
      accountType: 'Savings',
      isVerified: true,
      isDefault: false,
      balance: 15000.00
    }
  ]);

  // Credit Cards
  const [creditCards, setCreditCards] = useState([
    {
      id: 1,
      cardType: 'Visa',
      last4: '4242',
      expiryDate: '05/26',
      cardholderName: 'John Smith',
      isVerified: true,
      isDefault: true,
      creditLimit: 10000,
      availableCredit: 7500
    },
    {
      id: 2,
      cardType: 'Mastercard',
      last4: '8888',
      expiryDate: '08/25',
      cardholderName: 'John Smith',
      isVerified: true,
      isDefault: false,
      creditLimit: 15000,
      availableCredit: 12000
    }
  ]);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      method: 'PayPal',
      email: 'john.smith@email.com',
      isVerified: true,
      isDefault: true
    },
    {
      id: 2,
      method: 'Skrill',
      email: 'john.smith@skrill.com',
      isVerified: true,
      isDefault: false
    },
    {
      id: 3,
      method: 'Neteller',
      email: 'john.smith@neteller.com',
      isVerified: false,
      isDefault: false
    }
  ]);

  // Transaction History
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'Deposit',
      amount: 5000,
      currency: 'USD',
      method: 'Bank Transfer',
      status: 'Completed',
      date: '2024-03-07 10:30 AM',
      reference: 'DEP-2024-001',
      from: 'Chase Bank ****1234',
      to: 'Main Wallet',
      fee: 0
    },
    {
      id: 2,
      type: 'Withdrawal',
      amount: 1000,
      currency: 'USD',
      method: 'Credit Card',
      status: 'Pending',
      date: '2024-03-06 02:15 PM',
      reference: 'WDR-2024-002',
      from: 'Trading Account',
      to: 'Visa ****4242',
      fee: 2.50
    },
    {
      id: 3,
      type: 'Transfer',
      amount: 2500,
      currency: 'USD',
      method: 'Internal',
      status: 'Completed',
      date: '2024-03-05 09:45 AM',
      reference: 'TRF-2024-003',
      from: 'Main Wallet',
      to: 'Trading Account',
      fee: 0
    }
  ]);

  // Documents/Proof Uploads
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Passport.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2024-03-01',
      category: 'Identity Proof',
      status: 'Verified',
      url: '#'
    },
    {
      id: 2,
      name: 'Bank_Statement.pdf',
      type: 'PDF',
      size: '1.8 MB',
      uploadDate: '2024-03-01',
      category: 'Address Proof',
      status: 'Verified',
      url: '#'
    },
    {
      id: 3,
      name: 'Tax_Return_2023.pdf',
      type: 'PDF',
      size: '3.2 MB',
      uploadDate: '2024-03-05',
      category: 'Income Proof',
      status: 'Pending',
      url: '#'
    }
  ]);

  // Positions Data
  const [positions, setPositions] = useState([
    {
      id: 1,
      symbol: 'BTC/USD',
      type: 'LONG',
      quantity: 0.5,
      entryPrice: 42500,
      currentPrice: 43250,
      pnl: 375,
      pnlPercent: 1.76,
      liquidationPrice: 38250,
      margin: 2125
    },
    {
      id: 2,
      symbol: 'ETH/USD',
      type: 'SHORT',
      quantity: 5,
      entryPrice: 2850,
      currentPrice: 2820,
      pnl: 150,
      pnlPercent: 1.05,
      liquidationPrice: 3135,
      margin: 1425
    },
    {
      id: 3,
      symbol: 'EUR/USD',
      type: 'LONG',
      quantity: 10000,
      entryPrice: 1.0850,
      currentPrice: 1.0875,
      pnl: 25,
      pnlPercent: 0.23,
      liquidationPrice: 1.0650,
      margin: 1085
    }
  ]);

  // Orders Data
  const [orders, setOrders] = useState([
    {
      id: 1,
      symbol: 'BTC/USD',
      type: 'LIMIT',
      side: 'BUY',
      quantity: 0.1,
      price: 42000,
      status: 'OPEN',
      created: '2024-03-07T10:30:00'
    },
    {
      id: 2,
      symbol: 'ETH/USD',
      type: 'STOP',
      side: 'SELL',
      quantity: 2,
      price: 2900,
      status: 'OPEN',
      created: '2024-03-07T09:15:00'
    }
  ]);

  // Market Data
  const [marketData, setMarketData] = useState({
    'BTC/USD': { price: 43250, change: 2.5, volume: 1520000000 },
    'ETH/USD': { price: 2820, change: 1.8, volume: 850000000 },
    'EUR/USD': { price: 1.0875, change: 0.23, volume: 1200000000 },
    'GBP/USD': { price: 1.2650, change: -0.12, volume: 890000000 },
    'GOLD': { price: 2052.30, change: 0.38, volume: 3100000000 }
  });

  // Portfolio Chart Data
  const portfolioHistory = [
    { date: '2024-03-01', value: 50200 },
    { date: '2024-03-02', value: 50800 },
    { date: '2024-03-03', value: 51500 },
    { date: '2024-03-04', value: 51200 },
    { date: '2024-03-05', value: 52000 },
    { date: '2024-03-06', value: 52450 },
    { date: '2024-03-07', value: 53450 }
  ];

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'BTC/USD reached resistance level', type: 'info', read: false },
    { id: 2, message: 'Position liquidated: ETH/USD', type: 'warning', read: false },
    { id: 3, message: 'Deposit confirmed: $5,000', type: 'success', read: true }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Real-time price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => {
        const newData = {};
        Object.keys(prev).forEach(key => {
          const change = (Math.random() - 0.5) * 0.001;
          newData[key] = {
            ...prev[key],
            price: prev[key].price * (1 + change),
            change: prev[key].change + (Math.random() - 0.5) * 0.1
          };
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePlaceOrder = (orderData) => {
    console.log('Placing order:', orderData);
    setShowOrderForm(false);
  };

  const handleClosePosition = (positionId) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  };

  const handleCancelOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleTransfer = ({ from, to, amount }) => {
    console.log('Transferring:', { from, to, amount });
    // Update wallet balances
    if (from === 'wallet' && to === 'trading') {
      setWalletData(prev => ({
        ...prev,
        mainWallet: prev.mainWallet - amount,
        tradingWallet: prev.tradingWallet + amount
      }));
    }
  };

  const handleFileUpload = (file) => {
    const newDoc = {
      id: documents.length + 1,
      name: file.name,
      type: file.type.split('/')[1].toUpperCase(),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      uploadDate: new Date().toISOString().split('T')[0],
      category: 'New Document',
      status: 'Pending',
      url: '#'
    };
    setDocuments([...documents, newDoc]);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaChartLine className="text-gold-500 text-3xl animate-pulse" />
            </div>
          </div>
          <p className="text-gold-400 text-lg font-medium">Loading your dashboard...</p>
          <p className="text-gold-500/50 text-sm mt-2">Real-time data connecting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <Header 
        activeTab={activeMainTab}
        onTabChange={setActiveMainTab}
        portfolio={portfolio}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
        onQuickTrade={() => setShowOrderForm(true)}
        unreadNotifications={unreadNotifications}
      />
      
      <PriceTicker data={marketData} />

      <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
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
            paymentMethods={paymentMethods}
            transactions={transactions}
            onTransfer={handleTransfer}
            onShowTransferModal={() => setShowTransferModal(true)}
          />
        )}

        {activeMainTab === 'documents' && (
          <DocumentsTab 
            documents={documents}
            onUpload={() => setShowUploadModal(true)}
          />
        )}

        {activeMainTab === 'markets' && (
          <div className="bg-navy-800/50 rounded-xl p-8 text-center border border-gold-500/20">
            <h2 className="text-2xl font-bold text-gold-500 mb-4">Markets Overview</h2>
            <p className="text-gold-500/70">Market analysis and data coming soon...</p>
          </div>
        )}

        {activeMainTab === 'portfolio' && (
          <div className="bg-navy-800/50 rounded-xl p-8 text-center border border-gold-500/20">
            <h2 className="text-2xl font-bold text-gold-500 mb-4">Portfolio Analytics</h2>
            <p className="text-gold-500/70">Detailed portfolio analysis coming soon...</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <TransferModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        walletData={walletData}
        onConfirm={handleTransfer}
      />

      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
      />

      {/* Quick Trade Modal - You can create a similar component */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Quick Trade</h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-gold-500/70 hover:text-gold-500"
              >
                <FaTimes />
              </button>
            </div>
            {/* Import OrderForm component here */}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowOrderForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center text-navy-950 shadow-lg hover:bg-gold-600 transition-all hover:scale-110 z-40"
      >
        <FaBolt size={24} />
      </button>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;