import { useState, useEffect, useContext, useCallback } from 'react';
import tradingService from '../services/tradingService';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MARKET_INSTRUMENTS } from '../constants/marketData';
import websocketService from '../services/websocketService';

export const useDashboardData = (accountType = 'demo') => {
  const { user, refreshUser } = useContext(AuthContext);
  const isDemo = accountType === 'demo';

  // Find the active account ID based on the type
  const activeAccount = user?.accounts?.find(acc => {
      // Backend uses 'demo' and 'live' or 'real'
      const type = (acc.account_type || acc.type || '').toLowerCase();
      const targetType = (accountType || 'demo').toLowerCase();
      
      // Handle Aliases: 'real' matches 'live', and vice versa
      if (targetType === 'real' || targetType === 'live') {
          return type === 'real' || type === 'live';
      }
      
      return type === targetType;
  }) || user?.accounts?.[0]; // Fallback to first account if type mismatch

  const accountId = activeAccount?.id;
  
  // Debug log for troubleshooting (internal only)
  useEffect(() => {
    if (user) {
        if (!accountId) {
            console.warn(`[useDashboardData] No account match found for type: ${accountType}. Available:`, user.accounts?.map(a => a.account_type || a.type));
        }
    }
  }, [user, accountId, accountType]);

  const [bankAccounts, setBankAccounts] = useState(isDemo ? [
    { id: 1, bankName: 'Simulated Bank', accountNumber: '****1234', accountName: 'Demo User', isVerified: true, isDefault: true, balance: 1000.00 }
  ] : [
    { id: 1, bankName: 'Chase Bank', accountNumber: '****1234', accountName: 'Real User', isVerified: true, isDefault: true, balance: 0.00 }
  ]);

  const [creditCards, setCreditCards] = useState([
    { id: 1, cardType: 'Visa Pro', last4: '4242', expiryDate: '05/26', cardholderName: 'User Name', isVerified: true, isDefault: true }
  ]);

  const [transactions, setTransactions] = useState([
    { id: 'TX1001', date: '2024-03-10 14:30', type: 'Trade', symbol: 'BTCUSDT', amount: 500.00, status: 'Settled', reference: 'ORDER-99281', method: 'Market' },
    { id: 'TX1002', date: '2024-03-09 09:15', type: 'Deposit', amount: 1000.00, status: 'Completed', reference: 'DEP-11203', method: 'Visa ****4242' },
    { id: 'TX1003', date: '2024-03-08 18:45', type: 'Trade', symbol: 'EURUSD', amount: 150.00, status: 'Settled', reference: 'ORDER-99105', method: 'Market' },
    { id: 'TX1004', date: '2024-03-05 11:20', type: 'Transfer', amount: 200.00, status: 'Completed', reference: 'TRF-55821', method: 'Wallet to Account' },
    { id: 1, type: 'Demo Grant', amount: 1000, method: 'System Generation', status: 'Completed', date: new Date().toLocaleDateString(), reference: 'DEMO-INIT' }
  ]);

  const [documents, setDocuments] = useState([
    { id: 1, name: 'Passport.pdf', uploadDate: '2024-03-01', category: 'Identity Proof', status: 'Verified' },
    { id: 2, name: 'Bank_Statement.pdf', uploadDate: '2024-03-01', category: 'Address Proof', status: 'Verified' }
  ]);

  const [marketData, setMarketData] = useState(() => {
    const initial = {};
    MARKET_INSTRUMENTS.forEach(inst => {
      initial[inst.symbol] = { 
        price: inst.price, 
        change: inst.change, 
        volume: inst.volume,
        lastDir: 'none'
      };
    });
    return initial;
  });

  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([
    { id: 1, symbol: 'BTCUSDT', price: 45000, condition: 'above', status: 'active', createdAt: new Date().toISOString() },
    { id: 2, symbol: 'EURUSD', price: 1.0800, condition: 'below', status: 'active', createdAt: new Date().toISOString() }
  ]);

  // Fetch Positions from Backend
  const fetchPositions = useCallback(async () => {
    if (!accountId) return;
    try {
      const response = await tradingService.getOpenPositions(accountId);
      if (response.success) {
        const mappedPositions = response.data.map(pos => {
            const currentPrice = marketData[pos.symbol]?.price || parseFloat(pos.entry_price);
            const amount = parseFloat(pos.amount);
            const entryPrice = parseFloat(pos.entry_price);
            const side = pos.side.toUpperCase();
            
            const pnl = side === 'BUY' 
              ? (currentPrice - entryPrice) * amount
              : (entryPrice - currentPrice) * amount;

            return {
              id: pos.id,
              symbol: pos.symbol,
              type: side === 'BUY' ? 'BUY' : 'SELL',
              side: side.toLowerCase(),
              quantity: amount,
              entryPrice: entryPrice,
              currentPrice: currentPrice,
              pnl: pnl,
              pnlPercent: (pnl / (amount * entryPrice)) * 100,
              margin: (amount * entryPrice) / 10,
              createdAt: pos.created_at,
              entryTime: pos.created_at,
            };
        });
        setPositions(mappedPositions);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  }, [accountId, accountType]);

  useEffect(() => {
    fetchPositions();
    const pollInterval = setInterval(fetchPositions, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchPositions]);


  const portfolioHistory = [
    { date: '2024-03-01', value: 1020 },
    { date: '2024-03-07', value: 1345 }
  ];

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'BTC/USD reached resistance level', type: 'info', read: false },
    { id: 3, message: 'Deposit confirmed: $5,000', type: 'success', read: true }
  ]);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [
      {
        id: Date.now(),
        message,
        type,
        read: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  // Real-time market data integration
  useEffect(() => {
    const handleLiveData = (liveTickers) => {
      setMarketData(prev => {
        const newData = { ...prev };
        let updated = false;

        Object.keys(liveTickers).forEach(symbol => {
          if (newData[symbol]) {
            const oldPrice = newData[symbol].price;
            const newPrice = liveTickers[symbol].price;
            if (oldPrice !== newPrice) {
              newData[symbol] = {
                ...newData[symbol],
                price: newPrice,
                lastDir: newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'none',
              };
              updated = true;
            }
          }
        });

        // Mix in mock data for non-crypto assets like Stocks/Forex to maintain MVP activity
        Object.keys(newData).forEach(key => {
          if (!liveTickers[key]) {
            // Simulated subtle movement for non-Binance assets
            if (Math.random() > 0.7) { 
               const oldPrice = newData[key].price;
               const movement = 1 + (Math.random() - 0.5) * 0.0006;
               const newPrice = oldPrice * movement;
               
               newData[key] = {
                 ...newData[key],
                 price: newPrice,
                 lastDir: newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'none',
                 change: newData[key].change + (Math.random() - 0.5) * 0.02
               };
               updated = true;
            }
          }
        });

        return updated ? newData : prev;
      });
    };

    const unsubscribe = websocketService.subscribe(handleLiveData);
    
    // Fallback simulation timer for non-live assets, ticking every 1.5s
    const mockInterval = setInterval(() => {
        handleLiveData({}); // Trigger the mock generation logic for non-live assets
    }, 1500);

    return () => {
      unsubscribe();
      clearInterval(mockInterval);
    };
  }, []);

  // Handlers for state modification
  const handleAddBankAccount = (account) => setBankAccounts(prev => [...prev, account]);
  const handleDeleteBankAccount = (id) => setBankAccounts(prev => prev.filter(acc => acc.id !== id));
  const handleSetDefaultBankAccount = (id) => setBankAccounts(prev => prev.map(acc => ({
    ...acc,
    isDefault: acc.id === id
  })));

  const handleAddCreditCard = (card) => setCreditCards(prev => [...prev, card]);
  const handleDeleteCreditCard = (id) => setCreditCards(prev => prev.filter(card => card.id !== id));
  const handleSetDefaultCreditCard = (id) => setCreditCards(prev => prev.map(card => ({
    ...card,
    isDefault: card.id === id
  })));

  const handleDeposit = (amount, method) => {
    const newTx = {
      id: Date.now(),
      type: 'Deposit',
      amount: parseFloat(amount),
      method,
      status: 'Completed',
      date: new Date().toLocaleString(),
      reference: `DEP-${Math.random().toString(36).substring(7).toUpperCase()}`
    };
    setTransactions(prev => [newTx, ...prev]);
    addNotification(`Deposit initiated via ${method}: $${parseFloat(amount).toLocaleString()}`, 'success');
    // Note: Balance update logic would typically happen in a real backend, 
    // but here we'll let DashboardPage handle it via walletData if needed.
  };

  const handleWithdraw = (amount, method) => {
    const newTx = {
      id: Date.now(),
      type: 'Withdrawal',
      amount: parseFloat(amount),
      method,
      status: 'Pending',
      date: new Date().toLocaleString(),
      reference: `WDR-${Math.random().toString(36).substring(7).toUpperCase()}`
    };
    setTransactions(prev => [newTx, ...prev]);
    addNotification(`Withdrawal requested via ${method}: $${parseFloat(amount).toLocaleString()}`, 'warning');
  };

  const handleTransfer = (amount, from, to) => {
    const newTx = {
      id: Date.now(),
      type: 'Transfer',
      amount: parseFloat(amount),
      method: `${from} → ${to}`,
      status: 'Completed',
      date: new Date().toLocaleString(),
      reference: `TRF-${Math.random().toString(36).substring(7).toUpperCase()}`
    };
    setTransactions(prev => [newTx, ...prev]);
    addNotification(`Internal transfer completed: $${parseFloat(amount).toLocaleString()}`, 'info');
  };

  const handlePlaceOrder = async (order) => {
    if (!accountId) {
        toast.error("No active account found for this operation.");
        return;
    }

    try {
        const usdInvestment = parseFloat(order.amount);
        if (isNaN(usdInvestment) || usdInvestment <= 0) {
            toast.error("Please enter a valid investment amount.");
            return false;
        }

        const entryPrice = order.price || marketData[order.symbol]?.price || 43000;
        // Send the USD investment amount directly. Backend calculates quantity = amount / entryPrice.
        const response = await tradingService.executeTrade({
            accountId,
            symbol: order.symbol || 'BTCUSDT',
            side: order.side.toLowerCase(),
            amount: usdInvestment, // USD investment value
            entryPrice: entryPrice,
            type: order.type.toLowerCase()
        });


        if (response.success) {
            // Instead of manually adding raw data, refresh from server to get correct mapping
            await fetchPositions();
            toast.success(`${order.side} Order Executed!`);
            addNotification(`${order.side} ${order.symbol || 'BTCUSD'} order executed successfully`, 'success');
            // Refresh user data to update balances
            refreshUser();
            return true;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Order Execution Failed");
        return false;
    }
  };

  const handleUploadDocument = (doc) => {
    const newDoc = {
      id: Date.now(),
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      ...doc
    };
    setDocuments(prev => [newDoc, ...prev]);
    addNotification(`${doc.name || 'Document'} uploaded for review`, 'info');
  };

  const handleClosePosition = async (id) => {
      const position = positions.find(p => p.id === id);
      if (!position) return false;

      const exitPrice = marketData[position.symbol]?.price || position.currentPrice;

      try {
          const response = await tradingService.closePosition(id, exitPrice);
          if (response.success) {
              await fetchPositions();
              toast.success("Position Closed Successfully");
              addNotification(`Position ${position.symbol} closed successfully`, 'success');
              // Refresh user data to update balances
              refreshUser();
              return true;
          }
      } catch (error) {
          toast.error("Failed to close position");
          return false;
      }
  };
  
  const handleCancelOrder = (id) => setOrders(o => o.filter(ord => ord.id !== id));

  const handleCreateAlert = (alert) => {
    setPriceAlerts(prev => [{ id: Date.now(), ...alert, status: 'active', createdAt: new Date().toISOString() }, ...prev]);
    addNotification(`Price alert set for ${alert.symbol} at ${alert.price}`, 'info');
  };

  const handleDeleteAlert = (id) => setPriceAlerts(prev => prev.filter(a => a.id !== id));

  const handleMarkNotificationRead = (id) => {
    setNotifications(prev => prev.map((notification) => (
      notification.id === id ? { ...notification, read: true } : notification
    )));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map((notification) => ({ ...notification, read: true })));
  };

  return {
    bankAccounts,
    creditCards,
    transactions,
    documents,
    positions,
    orders,
    marketData,
    portfolioHistory,
    notifications,
    priceAlerts,
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
    handleCancelOrder,
    handleCreateAlert,
    handleDeleteAlert
  };
};
