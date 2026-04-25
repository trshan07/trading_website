import { useState, useEffect, useContext, useCallback } from 'react';
import tradingService from '../services/tradingService';
import fundingService from '../services/fundingService';
import kycService from '../services/kycService';
import userService from '../services/userService';
import infraService from '../services/infraService';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MARKET_INSTRUMENTS } from '../constants/marketData';
import websocketService from '../services/websocketService';

export const useDashboardData = (accountType = 'demo') => {
  const { user, refreshUser } = useContext(AuthContext);
  const isDemo = accountType === 'demo';

  // Find the active account ID based on the type
  const activeAccount = user?.accounts?.find(acc => {
      const type = (acc.account_type || acc.type || '').toLowerCase();
      const targetType = (accountType || 'demo').toLowerCase();
      if (targetType === 'real' || targetType === 'live') {
          return type === 'real' || type === 'live';
      }
      return type === targetType;
  }) || user?.accounts?.[0];

  const accountId = activeAccount?.id;
  
  // States - Initialized empty to wait for API data
  const [bankAccounts, setBankAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [settings, setSettings] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  
  const [portfolioHistory, setPortfolioHistory] = useState([
    { date: '2024-03-01', balance: 0 },
    { date: '2024-03-05', balance: 250 },
    { date: '2024-03-10', balance: 180 },
    { date: '2024-03-15', balance: 450 },
    { date: '2024-03-20', balance: 390 },
    { date: '2024-03-25', balance: 850 },
    { date: '2024-03-30', balance: 1000 }
  ]);
  
  const [marketData, setMarketData] = useState({});

  // --- Fetch Methods ---

  const fetchBanking = useCallback(async () => {
    try {
      const [banksRes, cardsRes] = await Promise.all([
        fundingService.getBankAccounts(),
        fundingService.getCreditCards()
      ]);
      if (banksRes.success) setBankAccounts(banksRes.data);
      if (cardsRes.success) setCreditCards(cardsRes.data);
    } catch (error) {
      console.error('Banking Fetch Failed:', error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fundingService.getTransactions();
      if (res.success) setTransactions(res.data);
    } catch (error) {
      console.error('Transaction Fetch Failed:', error);
    }
  }, []);

  const fetchInstruments = useCallback(async () => {
    try {
      const [instRes, catRes] = await Promise.all([
        infraService.getInstruments(),
        infraService.getCategories()
      ]);
      
      if (instRes.success) setInstruments(instRes.data);
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error('Fetch Instruments Error:', error);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await kycService.getDocuments();
      if (res.success) {
        const getRelativeUrl = (filePath) => {
          if (!filePath) return '';
          const match = filePath.match(/[\\/]uploads[\\/]/);
          if (match) {
            const index = filePath.indexOf(match[0]);
            return '/' + filePath.substring(index + 1).replace(/\\/g, '/');
          }
          return filePath.startsWith('/') ? filePath : `/${filePath}`;
        };

        const mappedDocs = res.data.map(doc => ({
          id: doc.id,
          name: doc.document_number, // We stored the original filename here
          category: doc.document_type,
          type: doc.file_path ? doc.file_path.split('.').pop().toUpperCase() : 'UNKNOWN',
          size: 'N/A',
          uploadDate: new Date(doc.created_at).toLocaleDateString(),
          status: doc.status.charAt(0).toUpperCase() + doc.status.slice(1),
          url: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${getRelativeUrl(doc.file_path)}`
        }));
        setDocuments(mappedDocs);
      }
    } catch (error) {
      console.error('KYC Fetch Failed:', error);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await tradingService.getAlerts();
      if (res.success) setPriceAlerts(res.data);
    } catch (error) {
      console.error('Alerts Fetch Failed:', error);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await userService.getSettings();
      if (res.success) setSettings(res.data);
    } catch (error) {
      console.error('Settings Fetch Failed:', error);
    }
  }, []);

  const fetchInfrastructure = useCallback(async () => {
    try {
      const [instRes, notifRes, logRes, favRes] = await Promise.all([
        infraService.getInstruments(),
        infraService.getNotifications(),
        infraService.getActivityLogs(),
        infraService.getFavorites()
      ]);

      if (instRes.success) {
        setInstruments(instRes.data);
        // Initialize market data from fetched instruments if not already populated
        setMarketData(prev => {
          const newData = { ...prev };
          instRes.data.forEach(inst => {
            if (!newData[inst.symbol]) {
              newData[inst.symbol] = {
                price: inst.price,
                change: inst.change,
                volume: inst.volume,
                lastDir: 'none'
              };
            }
          });
          return newData;
        });
      }
      if (notifRes.success) setNotifications(notifRes.data);
      if (logRes.success) setActivityLogs(logRes.data);
      if (favRes.success) setFavorites(favRes.data);

      // Fetch Platform Banking Info
      const platRes = await fundingService.getPlatformInfo();
      if (platRes.success) setPlatformInfo(platRes.data);
    } catch (error) {
      console.error('Infrastructure Fetch Failed:', error);
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    if (!accountId) return; // No account = nothing to fetch
    const token = localStorage.getItem('token');
    if (!token) return; // No token = don't fire, avoids 401 spam after logout
    try {
      const response = await tradingService.getOpenPositions(accountId);
      if (response.success) {
        const mappedPositions = response.data.map(pos => {
            const currentPrice = marketData[pos.symbol]?.price || parseFloat(pos.entry_price);
            const qty = parseFloat(pos.quantity);
            const entryPrice = parseFloat(pos.entry_price);
            const side = pos.side.toUpperCase();
            
            const pnl = side === 'BUY' 
              ? (currentPrice - entryPrice) * qty
              : (entryPrice - currentPrice) * qty;

            return {
              id: pos.id,
              symbol: pos.symbol,
              type: side,
              side: side.toLowerCase(),
              quantity: qty,
              entryPrice: entryPrice,
              currentPrice: currentPrice,
              pnl: pnl,
              pnlPercent: (pnl / (qty * entryPrice)) * 100,
              margin: parseFloat(pos.margin),
              createdAt: pos.created_at,
              entryTime: pos.created_at,
              swap: parseFloat(pos.swap) || 0,
              commission: parseFloat(pos.commission) || 0,
            };
        });
        setPositions(mappedPositions);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  }, [accountId, marketData]);

  // --- Initial Data loading Lifecycle ---
  useEffect(() => {
    if (user) {
      fetchBanking();
      fetchTransactions();
      fetchDocuments();
      fetchAlerts();
      fetchSettings();
      fetchInfrastructure();
    }
  }, [user, fetchBanking, fetchTransactions, fetchDocuments, fetchAlerts, fetchSettings, fetchInfrastructure]);

  useEffect(() => {
    if (!accountId) return; // Don't start polling at all without an account
    fetchPositions();
    const pollInterval = setInterval(fetchPositions, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchPositions, accountId]);

  // --- Handlers (Sync with Backend) ---

  const handleAddBankAccount = async (account) => {
    try {
      const res = await fundingService.addBankAccount(account);
      if (res.success) {
        setBankAccounts(prev => [...prev, res.data]);
        toast.success("Bank account added");
        return res;
      }
      return false;
    } catch (error) {
      toast.error("Failed to add bank account");
      return false;
    }
  };

  const handleDeleteBankAccount = async (id) => {
    try {
      const res = await fundingService.deleteBankAccount(id);
      if (res.success) {
        setBankAccounts(prev => prev.filter(acc => acc.id !== id));
        toast.success("Bank account removed");
      }
    } catch (error) {
      toast.error("Failed to delete bank account");
    }
  };

  const handleSetDefaultBankAccount = async (id) => {
    try {
      const res = await fundingService.setDefaultBankAccount(id);
      if (res.success) {
        fetchBanking(); // Refetch to sync defaults
        toast.success("Default bank account updated");
      }
    } catch (error) {
      toast.error("Failed to update default bank account");
    }
  };

  const handleAddCreditCard = async (card) => {
    try {
      const res = await fundingService.addCreditCard(card);
      if (res.success) {
        setCreditCards(prev => [...prev, res.data]);
        toast.success("Card added");
        return res;
      }
      return false;
    } catch (error) {
      console.error("Add Card Error:", error);
      toast.error("Failed to add card");
      return false;
    }
  };

  const handleDeleteCreditCard = async (id) => {
    try {
      const res = await fundingService.deleteCreditCard(id);
      if (res.success) {
        setCreditCards(prev => prev.filter(card => card.id !== id));
        toast.success("Card removed");
      }
    } catch (error) {
      toast.error("Failed to delete card");
    }
  };

  const handleSetDefaultCreditCard = async (id) => {
    try {
      const res = await fundingService.setDefaultCreditCard(id);
      if (res.success) {
        fetchBanking();
        toast.success("Default card updated");
      }
    } catch (error) {
      toast.error("Failed to update default card");
    }
  };

  const handleDeposit = async (amount, method, reference, proof = null) => {
    try {
      const res = await fundingService.deposit({
        amount: parseFloat(amount),
        method,
        accountId,
        reference,
        proof
      });
      if (res.success) {
        setTransactions(prev => [res.data, ...prev]);
        toast.success("Deposit request submitted");
        refreshUser();
      }
    } catch (error) {
      toast.error("Deposit submission failed");
    }
  };

  const handleWithdraw = async (amount, method) => {
    try {
      const res = await fundingService.withdraw({
        amount: parseFloat(amount),
        method,
        accountId
      });
      if (res.success) {
        setTransactions(prev => [res.data, ...prev]);
        toast.success("Withdrawal request submitted");
        refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
    }
  };

  const handleTransfer = async (amount, fromAccountId, toAccountId) => {
    try {
      const res = await fundingService.transfer({
        amount: parseFloat(amount),
        fromAccountId,
        toAccountId
      });
      if (res.success) {
        fetchTransactions();
        toast.success("Transfer completed");
        refreshUser();
      }
    } catch (error) {
      toast.error("Transfer failed");
    }
  };

  const handlePlaceOrder = async (order) => {
    if (!accountId) {
        toast.error("No active account found");
        return false;
    }

    try {
        const usdInvestment = parseFloat(order.amount);
        const entryPrice = order.price || marketData[order.symbol]?.price || 43000;
        
        const response = await tradingService.executeTrade({
            accountId,
            symbol: order.symbol || 'BTCUSDT',
            side: order.side.toLowerCase(),
            amount: usdInvestment,
            entryPrice: entryPrice,
            type: order.type.toLowerCase()
        });

        if (response.success) {
            await fetchPositions();
            toast.success(`${order.side} Order Executed!`);
            refreshUser();
            return true;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Order Failed");
        return false;
    }
  };

  const handleCancelOrder = async (id) => {
    try {
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success("Order Cancelled");
      return true;
    } catch (error) {
      toast.error("Failed to cancel order");
      return false;
    }
  };

  const handleClosePosition = async (id) => {
      const position = positions.find(p => p.id === id);
      if (!position) return false;

      const exitPrice = marketData[position.symbol]?.price || position.currentPrice;

      try {
          const response = await tradingService.closePosition(id, exitPrice);
          if (response.success) {
              await fetchPositions();
              fetchTransactions();
              toast.success("Position Closed Successfully");
              refreshUser();
              return true;
          }
      } catch (error) {
          toast.error("Failed to close position");
          return false;
      }
  };

  const handleUploadDocument = async (doc) => {
    try {
      const res = await kycService.uploadDocument(doc);
      if (res.success) {
        const docData = res.data;
        
        const getRelativeUrl = (filePath) => {
          if (!filePath) return '';
          const match = filePath.match(/[\\/]uploads[\\/]/);
          if (match) {
            const index = filePath.indexOf(match[0]);
            return '/' + filePath.substring(index + 1).replace(/\\/g, '/');
          }
          return filePath.startsWith('/') ? filePath : `/${filePath}`;
        };

        const mappedDoc = {
          id: docData.id,
          name: docData.document_number,
          category: docData.document_type,
          type: docData.file_path ? docData.file_path.split('.').pop().toUpperCase() : 'UNKNOWN',
          size: 'N/A',
          uploadDate: new Date(docData.created_at).toLocaleDateString(),
          status: docData.status.charAt(0).toUpperCase() + docData.status.slice(1),
          url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${getRelativeUrl(docData.file_path)}`
        };
        setDocuments(prev => [mappedDoc, ...prev]);
        toast.success("Document uploaded");
      }
    } catch (error) {
      toast.error("Failed to upload document");
    }
  };

  const handleCreateAlert = async (alert) => {
    try {
      const res = await tradingService.createAlert(alert);
      if (res.success) {
        setPriceAlerts(prev => [res.data, ...prev]);
        toast.success("Price alert set");
      }
    } catch (error) {
      toast.error("Failed to create alert");
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      const res = await tradingService.deleteAlert(id);
      if (res.success) {
        setPriceAlerts(prev => prev.filter(a => a.id !== id));
        toast.success("Alert deleted");
      }
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const res = await userService.updateSettings(newSettings);
      if (res.success) {
        setSettings(res.data);
        toast.success("Global preferences saved");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      const res = await infraService.markNotificationRead(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await infraService.markAllNotificationsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
        toast.success("Notifications cleared");
      }
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const handleToggleFavorite = async (symbol) => {
    try {
      const res = await infraService.toggleFavorite(symbol);
      if (res.success) {
        if (res.action === 'added') {
          setFavorites(prev => [...prev, symbol]);
          toast.success(`Positioned ${symbol} in Watchlist`);
        } else {
          setFavorites(prev => prev.filter(s => s !== symbol));
          toast.success(`Removed ${symbol} from Watchlist`);
        }
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    }
  };

  // --- WebSocket Price Integration (Kept as is for UX) ---
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

        // Simulate subtle movement for non-live assets
        Object.keys(newData).forEach(key => {
          if (!liveTickers[key]) {
            if (Math.random() > 0.8) { 
               const oldPrice = newData[key].price;
               const movement = 1 + (Math.random() - 0.5) * 0.0006;
               const newPrice = oldPrice * movement;
               newData[key] = {
                 ...newData[key],
                 price: newPrice,
                 lastDir: newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'none',
               };
               updated = true;
            }
          }
        });

        return updated ? newData : prev;
      });
    };

    const unsubscribe = websocketService.subscribe(handleLiveData);
    const mockInterval = setInterval(() => handleLiveData({}), 1500);

    return () => {
      unsubscribe();
      clearInterval(mockInterval);
    };
  }, []);

  return {
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
    platformInfo,
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
    handleCancelOrder,
    handleUploadDocument,
    handleClosePosition,
    handleCreateAlert,
    handleDeleteAlert,
    handleUpdateSettings,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleToggleFavorite,
    favorites,
    activityLogs,
    instruments,
    categories,
    portfolioHistory,
    unreadNotifications: notifications.filter(n => !n.is_read).length
  };
};
