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
import { maskAccountNumber } from '../components/client/banking/utils';
import { getUploadUrl } from '../utils/uploadUrl';

const normalizeInstrument = (instrument = {}) => ({
  symbol: instrument.symbol,
  name: instrument.name || instrument.symbol,
  category: instrument.category || 'General',
  price: Number.parseFloat(instrument.price ?? instrument.default_price ?? 0) || 0,
  change: Number.parseFloat(instrument.change ?? instrument.default_change ?? 0) || 0,
  volume: instrument.volume ?? instrument.default_volume ?? null,
});

const fallbackInstruments = MARKET_INSTRUMENTS.map(normalizeInstrument);

const mergeInstrumentSources = (primary = [], secondary = []) => {
  const merged = new Map();

  secondary
    .map(normalizeInstrument)
    .filter((instrument) => instrument.symbol)
    .forEach((instrument) => {
      merged.set(instrument.symbol, instrument);
    });

  primary
    .map(normalizeInstrument)
    .filter((instrument) => instrument.symbol)
    .forEach((instrument) => {
      merged.set(instrument.symbol, {
        ...merged.get(instrument.symbol),
        ...instrument,
      });
    });

  return Array.from(merged.values());
};

const deriveCategories = (instrumentList = []) => Array.from(
  new Set(
    instrumentList
      .map((instrument) => instrument.category)
      .filter(Boolean)
  )
).sort((a, b) => a.localeCompare(b));

const buildMarketSnapshot = (instrumentList = []) => instrumentList.reduce((acc, instrument) => {
  if (!instrument?.symbol) {
    return acc;
  }

  acc[instrument.symbol] = {
    price: instrument.price,
    change: instrument.change,
    volume: instrument.volume,
    lastDir: 'none',
  };
  return acc;
}, {});

const mergeQuoteSnapshot = (current = {}, incoming = {}) => {
  const next = { ...current };

  Object.entries(incoming).forEach(([symbol, quote]) => {
    if (!quote) {
      return;
    }

    const previous = current[symbol] || {};
    const nextPrice = Number.parseFloat(quote.price ?? previous.price ?? 0) || 0;
    const prevPrice = Number.parseFloat(previous.price ?? nextPrice) || nextPrice;

    next[symbol] = {
      ...previous,
      ...quote,
      price: nextPrice,
      lastDir: nextPrice > prevPrice ? 'up' : nextPrice < prevPrice ? 'down' : (previous.lastDir || 'none'),
    };
  });

  return next;
};

const buildPortfolioHistory = ({ activeAccount, positions = [], transactions = [], marketData = {} }) => {
  const now = new Date();
  const currentBalance = (Number.parseFloat(activeAccount?.balance) || 0) + (Number.parseFloat(activeAccount?.credit) || 0);
  const unrealizedPnl = positions.reduce((acc, position) => {
    const currentPrice = Number.parseFloat(marketData[position.symbol]?.price ?? position.currentPrice ?? position.entryPrice) || 0;
    const entryPrice = Number.parseFloat(position.entryPrice) || 0;
    const quantity = Number.parseFloat(position.quantity) || 0;
    const side = String(position.type || position.side || 'buy').toUpperCase();

    if (!entryPrice || !quantity) {
      return acc;
    }

    return acc + (side === 'BUY'
      ? (currentPrice - entryPrice) * quantity
      : (entryPrice - currentPrice) * quantity);
  }, 0);

  const currentEquity = currentBalance + unrealizedPnl;
  const relevantTransactions = [...transactions]
    .filter((transaction) => {
      if (!activeAccount?.id) {
        return true;
      }
      return !transaction.accountId || transaction.accountId === activeAccount.id;
    })
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

  if (relevantTransactions.length === 0) {
    return Array.from({ length: 7 }, (_, index) => {
      const pointDate = new Date(now);
      pointDate.setDate(now.getDate() - (6 - index));
      return {
        date: pointDate.toISOString().split('T')[0],
        balance: Number(currentEquity.toFixed(2)),
      };
    });
  }

  const history = [];

  relevantTransactions.forEach((transaction) => {
    const txDate = new Date(transaction.createdAt || transaction.created_at || now);
    const balanceAfter = Number.parseFloat(
      transaction.balance_after
      ?? transaction.balanceAfter
      ?? transaction.balance_after_trade
    );
    const signedAmount = Number.parseFloat(transaction.signedAmount ?? transaction.amount ?? 0) || 0;
    const fallbackBalance = history.length > 0 ? history[history.length - 1].balance + signedAmount : currentBalance + signedAmount;

    history.push({
      date: txDate.toISOString().split('T')[0],
      balance: Number((Number.isFinite(balanceAfter) ? balanceAfter : fallbackBalance).toFixed(2)),
    });
  });

  history.push({
    date: now.toISOString().split('T')[0],
    balance: Number(currentEquity.toFixed(2)),
  });

  const compacted = history.reduce((acc, point) => {
    const last = acc[acc.length - 1];
    if (last?.date === point.date) {
      last.balance = point.balance;
      return acc;
    }
    acc.push(point);
    return acc;
  }, []);

  return compacted.slice(-30);
};

const toTitleCase = (value = '') => value
  .toString()
  .replace(/_/g, ' ')
  .toLowerCase()
  .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeDocument = (doc = {}) => ({
  id: doc.id,
  name: doc.document_number || doc.name || 'Document',
  category: doc.document_type || doc.category || 'General',
  type: doc.file_path ? doc.file_path.split('.').pop().toUpperCase() : (doc.type || 'UNKNOWN'),
  size: 'N/A',
  uploadDate: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '',
  status: toTitleCase(doc.status || 'pending'),
  url: getUploadUrl(doc.file_path),
});

const normalizeBankAccount = (account = {}) => ({
  ...account,
  id: account.id,
  bankName: account.bankName || account.bank_name || '',
  branchName: account.branchName || account.branch_name || '',
  branchCode: account.branchCode || account.branch_code || '',
  country: account.country || '',
  accountHolderName: account.accountHolderName || account.account_holder_name || account.account_name || '',
  accountName: account.accountName || account.account_name || account.account_holder_name || '',
  accountNumber: account.accountNumber || account.account_number || '',
  maskedAccountNumber: account.maskedAccountNumber || maskAccountNumber(account.accountNumber || account.account_number || ''),
  accountType: account.accountType || account.account_type || '',
  currency: account.currency || 'USD',
  swiftCode: account.swiftCode || account.swift_code || '',
  iban: account.iban || '',
  beneficiaryName: account.beneficiaryName || account.beneficiary_name || '',
  relationship: account.relationship || '',
  proofFile: account.proofFile || account.proof_file || '',
  isDefault: Boolean(account.isDefault ?? account.is_default),
  isVerified: Boolean(account.isVerified ?? account.is_verified),
});

const normalizeCreditCard = (card = {}) => {
  const expiry = card.expiry || card.expiryDate || card.expiry_date || '';
  const [expiryMonth = '', expiryYear = ''] = expiry.split('/');

  return {
    ...card,
    id: card.id,
    cardType: card.cardType || card.card_type || 'Card',
    last4: card.last4 || '0000',
    expiry,
    expiryDate: expiry,
    expiryMonth,
    expiryYear,
    cardholderName: card.cardholderName || card.cardholder_name || '',
    billingAddress: card.billingAddress || card.billing_address || '',
    isDefault: Boolean(card.isDefault ?? card.is_default),
    isVerified: Boolean(card.isVerified ?? card.is_verified),
    availableCredit: Number.parseFloat(card.availableCredit ?? card.available_credit ?? 0) || 0,
  };
};

const normalizeTransaction = (transaction = {}) => {
  const rawType = (transaction.type || '').toString().toLowerCase();
  const type = rawType === 'withdrawal'
    ? 'Withdrawal'
    : rawType === 'deposit'
      ? 'Deposit'
      : rawType === 'transfer'
        ? 'Transfer'
        : toTitleCase(transaction.type || 'Transaction');
  const amount = Number.parseFloat(transaction.amount ?? 0) || 0;
  const createdAt = transaction.created_at || transaction.createdAt || null;
  const defaultStatus = transaction.source_type === 'funding_request' ? 'Pending' : 'Completed';

  return {
    ...transaction,
    id: `${transaction.source_type || 'transaction'}-${transaction.id}`,
    rawId: transaction.id,
    sourceType: transaction.source_type || 'transaction',
    accountId: transaction.accountId || transaction.account_id || null,
    createdAt,
    date: createdAt ? new Date(createdAt).toLocaleDateString() : '',
    type,
    amount: Math.abs(amount),
    signedAmount: amount,
    method: transaction.method || (type === 'Transfer' ? 'Internal Transfer' : 'Wallet'),
    status: toTitleCase(transaction.status || defaultStatus),
    reference: transaction.reference || transaction.bank_reference || transaction.reference_id || '-',
    description: transaction.description || '',
  };
};

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
  
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  
  const [marketData, setMarketData] = useState({});

  // --- Fetch Methods ---

  const fetchBanking = useCallback(async () => {
    try {
      const [banksRes, cardsRes] = await Promise.all([
        fundingService.getBankAccounts(),
        fundingService.getCreditCards()
      ]);
      if (banksRes.success) setBankAccounts((banksRes.data || []).map(normalizeBankAccount));
      if (cardsRes.success) setCreditCards((cardsRes.data || []).map(normalizeCreditCard));
    } catch (error) {
      console.error('Banking Fetch Failed:', error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fundingService.getTransactions();
      if (res.success) setTransactions((res.data || []).map(normalizeTransaction));
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

      const mergedInstruments = mergeInstrumentSources(
        instRes.success ? instRes.data : [],
        fallbackInstruments
      );

      setInstruments(mergedInstruments);
      setCategories(
        catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0
          ? catRes.data
          : deriveCategories(mergedInstruments)
      );
      setMarketData((prev) => ({
        ...buildMarketSnapshot(mergedInstruments),
        ...prev,
      }));
    } catch (error) {
      console.error('Fetch Instruments Error:', error);
      setInstruments(fallbackInstruments);
      setCategories(deriveCategories(fallbackInstruments));
      setMarketData((prev) => ({
        ...buildMarketSnapshot(fallbackInstruments),
        ...prev,
      }));
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await kycService.getDocuments();
      if (res.success) {
        setDocuments((res.data || []).map(normalizeDocument));
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
      const [instRes, catRes, notifRes, logRes, favRes] = await Promise.all([
        infraService.getInstruments(),
        infraService.getCategories(),
        infraService.getNotifications(),
        infraService.getActivityLogs(),
        infraService.getFavorites()
      ]);

      const mergedInstruments = mergeInstrumentSources(
        instRes.success ? instRes.data : [],
        fallbackInstruments
      );

      setInstruments(mergedInstruments);
      setCategories(
        catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0
          ? catRes.data
          : deriveCategories(mergedInstruments)
      );
      setMarketData((prev) => ({
        ...buildMarketSnapshot(mergedInstruments),
        ...prev,
      }));

      if (notifRes.success) setNotifications(notifRes.data);
      if (logRes.success) setActivityLogs(logRes.data);
      if (favRes.success) setFavorites(favRes.data);

      // Fetch Platform Banking Info
      const platRes = await fundingService.getPlatformInfo();
      if (platRes.success) setPlatformInfo(platRes.data);
    } catch (error) {
      console.error('Infrastructure Fetch Failed:', error);
      setInstruments(fallbackInstruments);
      setCategories(deriveCategories(fallbackInstruments));
      setMarketData((prev) => ({
        ...buildMarketSnapshot(fallbackInstruments),
        ...prev,
      }));
    }
  }, []);

  const fetchLiveQuotes = useCallback(async (symbols = []) => {
    const filteredSymbols = Array.from(new Set(symbols.filter(Boolean)));
    if (filteredSymbols.length === 0) {
      return;
    }

    try {
      const response = await infraService.getMarketQuotes(filteredSymbols);
      if (response.success && response.data) {
        setMarketData((prev) => mergeQuoteSnapshot(prev, response.data));
      }
    } catch (error) {
      console.error('Live Quotes Fetch Failed:', error);
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
            const totalPositionValue = parseFloat(pos.amount) || (qty * entryPrice);
            const side = pos.side.toUpperCase();
            
            const pnl = side === 'BUY' 
              ? (currentPrice - entryPrice) * qty
              : (entryPrice - currentPrice) * qty;

            return {
              id: pos.id,
              symbol: pos.symbol,
              type: side,
              side: side.toLowerCase(),
              amount: totalPositionValue,
              quantity: qty,
              entryPrice: entryPrice,
              currentPrice: currentPrice,
              pnl: pnl,
              pnlPercent: totalPositionValue > 0 ? (pnl / totalPositionValue) * 100 : 0,
              margin: parseFloat(pos.margin),
              leverage: parseFloat(pos.leverage) || null,
              takeProfit: pos.take_profit != null ? parseFloat(pos.take_profit) : null,
              stopLoss: pos.stop_loss != null ? parseFloat(pos.stop_loss) : null,
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

  const fetchOrders = useCallback(async () => {
    if (!accountId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await tradingService.getOpenOrders(accountId);
      if (response.success) {
        const mappedOrders = (response.data || []).map((order) => ({
          id: order.id,
          symbol: order.symbol,
          type: (order.type || 'limit').toUpperCase(),
          side: (order.side || 'buy').toUpperCase(),
          amount: parseFloat(order.amount) || 0,
          quantity: parseFloat(order.quantity) || 0,
          entryPrice: parseFloat(order.entry_price) || 0,
          leverage: parseFloat(order.leverage) || null,
          takeProfit: order.take_profit != null ? parseFloat(order.take_profit) : null,
          stopLoss: order.stop_loss != null ? parseFloat(order.stop_loss) : null,
          createdAt: order.created_at,
          status: order.status,
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, [accountId]);

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
    if (!user || instruments.length === 0) {
      return undefined;
    }

    const instrumentSymbols = instruments.map((instrument) => instrument.symbol).filter(Boolean);
    fetchLiveQuotes(instrumentSymbols);

    const quoteInterval = setInterval(() => {
      fetchLiveQuotes(instrumentSymbols);
    }, 15000);

    return () => clearInterval(quoteInterval);
  }, [fetchLiveQuotes, instruments, user]);

  useEffect(() => {
    if (!accountId) return; // Don't start polling at all without an account
    fetchOrders();
    fetchPositions();
    const pollInterval = setInterval(() => {
      fetchPositions();
      fetchOrders();
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchPositions, fetchOrders, accountId]);

  useEffect(() => {
    setPortfolioHistory(buildPortfolioHistory({
      activeAccount,
      positions,
      transactions,
      marketData,
    }));
  }, [activeAccount, marketData, positions, transactions]);

  // --- Handlers (Sync with Backend) ---

  const handleAddBankAccount = async (account) => {
    try {
      const res = await fundingService.addBankAccount(account);
      if (res.success) {
        setBankAccounts(prev => [...prev, normalizeBankAccount(res.data)]);
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
        setCreditCards(prev => [...prev, normalizeCreditCard(res.data)]);
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
        setTransactions(prev => [normalizeTransaction({ ...res.data, source_type: 'funding_request' }), ...prev]);
        toast.success("Deposit request submitted");
        refreshUser();
        return true;
      }
      return false;
    } catch (error) {
      toast.error("Deposit submission failed");
      return false;
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
        setTransactions(prev => [normalizeTransaction({ ...res.data, source_type: 'funding_request' }), ...prev]);
        toast.success("Withdrawal request submitted");
        refreshUser();
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
      return false;
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
        const instrumentPrice = instruments.find((instrument) => instrument.symbol === order.symbol)?.price;
        const entryPrice = order.price || marketData[order.symbol]?.price || instrumentPrice || 43000;
        
        const response = await tradingService.executeTrade({
            accountId,
            symbol: order.symbol || 'BTCUSDT',
            side: order.side.toLowerCase(),
            amount: usdInvestment,
            entryPrice: entryPrice,
            type: order.type.toLowerCase(),
            leverage: order.leverage,
            takeProfit: order.takeProfit,
            stopLoss: order.stopLoss
        });

        if (response.success) {
            if (order.type.toLowerCase() === 'limit') {
              await fetchOrders();
              toast.success(`${order.side} Limit Order Placed!`);
            } else {
              await fetchPositions();
              toast.success(`${order.side} Order Executed!`);
            }
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
      const res = await tradingService.cancelOrder(id);
      if (!res.success) {
        throw new Error('Cancel failed');
      }
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
        setDocuments(prev => [normalizeDocument(res.data), ...prev]);
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

  // --- Chart Sync Integration ---
  useEffect(() => {
    const handleChartUpdate = (e) => {
      const { symbol, price } = e.detail;
      setMarketData(prev => {
        if (!prev[symbol]) return prev;
        if (prev[symbol].price === price) return prev;

        return {
          ...prev,
          [symbol]: {
            ...prev[symbol],
            price: price,
            lastDir: price > prev[symbol].price ? 'up' : price < prev[symbol].price ? 'down' : 'none'
          }
        };
      });
    };

    window.addEventListener('active_price_update', handleChartUpdate);
    return () => window.removeEventListener('active_price_update', handleChartUpdate);
  }, []);

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
                bid: liveTickers[symbol].bid,
                ask: liveTickers[symbol].ask,
                change: liveTickers[symbol].change,
                volume: liveTickers[symbol].volume,
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
    unreadNotifications: notifications.filter((n) => !(n.is_read || n.read)).length
  };
};
