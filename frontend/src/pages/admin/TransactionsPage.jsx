// frontend/src/pages/admin/TransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaExchangeAlt,
  FaCheck,
  FaTimes,
  FaEye,
  FaDownload,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaFileInvoice,
  FaUniversity, // This replaces FaBank
  FaBitcoin,
  FaWallet,
  FaExclamationTriangle,
  FaHistory,
  FaPlusCircle,
  FaMinusCircle,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock transactions data
    const mockTransactions = [
      {
        id: 'TXN001',
        type: 'deposit',
        userId: 101,
        userName: 'John Smith',
        userEmail: 'john.smith@example.com',
        amount: 5000,
        currency: 'USD',
        method: 'wire_transfer',
        status: 'pending',
        createdAt: '2024-03-07T10:30:00',
        reference: 'REF123456',
        bankDetails: {
          bankName: 'Chase Bank',
          accountNumber: '****1234',
          routingNumber: '****5678',
          accountName: 'John Smith'
        },
        proofDocument: '/mock/proof1.pdf'
      },
      {
        id: 'TXN002',
        type: 'withdrawal',
        userId: 102,
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@example.com',
        amount: 2500,
        currency: 'USD',
        method: 'credit_card',
        status: 'approved',
        createdAt: '2024-03-07T09:15:00',
        processedAt: '2024-03-07T11:20:00',
        approvedBy: 'Admin User',
        reference: 'REF789012',
        cardDetails: {
          cardType: 'Visa',
          lastFour: '4567',
          cardHolder: 'Sarah Johnson'
        }
      },
      {
        id: 'TXN003',
        type: 'deposit',
        userId: 103,
        userName: 'Mike Wilson',
        userEmail: 'mike.w@example.com',
        amount: 10000,
        currency: 'USD',
        method: 'crypto',
        status: 'completed',
        createdAt: '2024-03-06T15:45:00',
        completedAt: '2024-03-06T16:30:00',
        reference: 'REF345678',
        cryptoDetails: {
          currency: 'BTC',
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          txid: '8b4e5a8f9d1c2b3a4e5f6g7h8i9j0k1l2m3n4o5p',
          network: 'Bitcoin'
        }
      },
      {
        id: 'TXN004',
        type: 'withdrawal',
        userId: 104,
        userName: 'Emma Brown',
        userEmail: 'emma.b@example.com',
        amount: 3500,
        currency: 'USD',
        method: 'wire_transfer',
        status: 'rejected',
        createdAt: '2024-03-06T10:20:00',
        rejectedAt: '2024-03-06T14:15:00',
        rejectedBy: 'Admin User',
        rejectionReason: 'Insufficient funds',
        reference: 'REF901234',
        bankDetails: {
          bankName: 'Wells Fargo',
          accountNumber: '****5678',
          routingNumber: '****9012',
          accountName: 'Emma Brown'
        }
      },
      {
        id: 'TXN005',
        type: 'deposit',
        userId: 105,
        userName: 'David Lee',
        userEmail: 'david.lee@example.com',
        amount: 15000,
        currency: 'USD',
        method: 'credit_card',
        status: 'pending',
        createdAt: '2024-03-07T08:45:00',
        reference: 'REF567890',
        cardDetails: {
          cardType: 'Mastercard',
          lastFour: '8901',
          cardHolder: 'David Lee'
        }
      }
    ];

    setTransactions(mockTransactions);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">Approved</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">Completed</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">Rejected</span>;
      default:
        return null;
    }
  };

  const getMethodIcon = (method) => {
    switch(method) {
      case 'wire_transfer':
        return <FaUniversity className="text-blue-500" size={20} />;
      case 'credit_card':
        return <FaCreditCard className="text-green-500" size={20} />;
      case 'crypto':
        return <FaBitcoin className="text-orange-500" size={20} />;
      default:
        return <FaWallet className="text-gray-500" size={20} />;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'deposit':
        return <FaPlusCircle className="text-green-500" size={16} />;
      case 'withdrawal':
        return <FaMinusCircle className="text-red-500" size={16} />;
      default:
        return <FaExchangeAlt className="text-blue-500" size={16} />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'deposit':
        return 'text-green-600 dark:text-green-400';
      case 'withdrawal':
        return 'text-red-600 dark:text-red-400';
      case 'transfer':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Calculate statistics
  const stats = {
    totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    pendingAmount: transactions.filter(tx => tx.status === 'pending').reduce((sum, tx) => sum + tx.amount, 0),
    approvedToday: transactions.filter(tx => tx.status === 'approved' && new Date(tx.createdAt).toDateString() === new Date().toDateString()).reduce((sum, tx) => sum + tx.amount, 0),
    totalCount: transactions.length,
    pendingCount: transactions.filter(tx => tx.status === 'pending').length
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && tx.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor and process all financial transactions
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FaHistory className="mr-2" size={14} />
            Transaction History
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FaDownload className="mr-2" size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume (24h)</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${(stats.totalVolume).toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">↑ 12.5% from yesterday</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-600">${(stats.pendingAmount).toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.pendingCount} pending transactions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Approved Today</p>
          <p className="text-2xl font-bold text-green-600">${(stats.approvedToday).toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 transactions processed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Transaction</p>
          <p className="text-2xl font-bold text-purple-600">${(stats.totalVolume / stats.totalCount || 0).toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across {stats.totalCount} transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction ID, user, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Transactions</option>
            <option value="deposit">Deposits Only</option>
            <option value="withdrawal">Withdrawals Only</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Completed</option>
            <option>Rejected</option>
          </select>

          <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <FaFilter className="mr-2" size={14} />
            More Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tx.reference}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tx.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(tx.type)}
                      <span className={`ml-2 text-sm font-medium capitalize ${getTypeColor(tx.type)}`}>
                        {tx.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ${tx.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tx.currency}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMethodIcon(tx.method)}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {tx.method.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedTransaction(tx)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      title="View Details"
                    >
                      <FaEye size={16} />
                    </button>
                    {tx.status === 'pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mr-3" title="Approve">
                          <FaCheck size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Reject">
                          <FaTimes size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing 1 to {filteredTransactions.length} of {transactions.length} transactions
            </p>
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <FaArrowLeft className="mr-1" size={12} />
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">1</button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                3
              </button>
              <button className="flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Next
                <FaArrowRight className="ml-1" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              {/* Status Banner */}
              <div className={`mb-6 p-4 rounded-lg ${
                selectedTransaction.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                selectedTransaction.status === 'approved' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                selectedTransaction.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center">
                  {selectedTransaction.status === 'pending' && <FaExclamationTriangle className="text-yellow-600 mr-2" />}
                  {selectedTransaction.status === 'approved' && <FaCheck className="text-blue-600 mr-2" />}
                  {selectedTransaction.status === 'completed' && <FaCheck className="text-green-600 mr-2" />}
                  {selectedTransaction.status === 'rejected' && <FaTimes className="text-red-600 mr-2" />}
                  <span className={`font-medium ${
                    selectedTransaction.status === 'pending' ? 'text-yellow-800 dark:text-yellow-300' :
                    selectedTransaction.status === 'approved' ? 'text-blue-800 dark:text-blue-300' :
                    selectedTransaction.status === 'completed' ? 'text-green-800 dark:text-green-300' :
                    'text-red-800 dark:text-red-300'
                  }`}>
                    Transaction {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Transaction Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.id}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.reference}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTransaction.userEmail}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                  <div className="flex items-center">
                    {getTypeIcon(selectedTransaction.type)}
                    <span className={`ml-2 text-sm font-medium capitalize ${getTypeColor(selectedTransaction.type)}`}>
                      {selectedTransaction.type}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Method</p>
                  <div className="flex items-center">
                    {getMethodIcon(selectedTransaction.method)}
                    <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                      {selectedTransaction.method.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedTransaction.processedAt && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Processed</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedTransaction.processedAt).toLocaleString()}
                    </p>
                    {selectedTransaction.approvedBy && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">By: {selectedTransaction.approvedBy}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Method-specific details */}
              {selectedTransaction.method === 'wire_transfer' && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <FaUniversity className="mr-2 text-blue-500" />
                    Bank Transfer Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bank Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Account Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.bankDetails.accountName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Account Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Routing Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.bankDetails.routingNumber}</p>
                    </div>
                  </div>
                  {selectedTransaction.proofDocument && (
                    <button className="mt-3 flex items-center text-blue-600 hover:text-blue-700">
                      <FaFileInvoice className="mr-2" />
                      View Proof Document
                    </button>
                  )}
                </div>
              )}

              {selectedTransaction.method === 'credit_card' && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <FaCreditCard className="mr-2 text-green-500" />
                    Credit Card Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Card Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.cardDetails.cardType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Card Holder</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.cardDetails.cardHolder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Four</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.cardDetails.lastFour}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTransaction.method === 'crypto' && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <FaBitcoin className="mr-2 text-orange-500" />
                    Cryptocurrency Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Currency</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.cryptoDetails.currency} ({selectedTransaction.cryptoDetails.network})</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-xs font-mono text-gray-900 dark:text-white break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {selectedTransaction.cryptoDetails.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                      <p className="text-xs font-mono text-gray-900 dark:text-white break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {selectedTransaction.cryptoDetails.txid}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedTransaction.status === 'rejected' && selectedTransaction.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700 dark:text-red-400">{selectedTransaction.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons for pending transactions */}
              {selectedTransaction.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Contact User
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Reject Transaction
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Approve Transaction
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;