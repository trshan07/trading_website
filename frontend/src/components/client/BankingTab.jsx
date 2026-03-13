// frontend/src/components/client/BankingTab.jsx
import React, { useState } from 'react';
import { 
  FaWallet, FaExchangeAlt, FaMoneyBillWave, FaLandmark,
  FaCreditCard, FaMobileAlt, FaHistory, FaArrowRight,
  FaPlus, FaDownload, FaFileInvoice, FaUniversity,
  FaCheck, FaTimes, FaEye, FaTrash, FaEdit,
  FaPaypal, FaBitcoin, FaArrowUp, FaArrowDown,
  FaShieldAlt
} from 'react-icons/fa';

const BankingTab = ({ 
  walletData, 
  bankAccounts, 
  creditCards, 
  paymentMethods, 
  transactions,
  onTransfer,
  onShowTransferModal
}) => {
  const [activeBankingTab, setActiveBankingTab] = useState('overview');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');

  const bankingTabs = [
    { id: 'overview', label: 'Banking Overview', icon: FaUniversity },
    { id: 'transfer', label: 'Internal Transfer', icon: FaExchangeAlt },
    { id: 'withdraw', label: 'Withdrawals', icon: FaMoneyBillWave },
    { id: 'accounts', label: 'Bank Accounts', icon: FaLandmark },
    { id: 'cards', label: 'Credit Cards', icon: FaCreditCard },
    { id: 'payment', label: 'Payment Methods', icon: FaMobileAlt },
    { id: 'history', label: 'Transaction History', icon: FaHistory }
  ];

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  const depositMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, processing: '1-3 business days', fee: 'Free' },
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, processing: 'Instant', fee: '2.5%' },
    { id: 'paypal', name: 'PayPal', icon: FaPaypal, processing: 'Instant', fee: '1.5%' },
    { id: 'crypto', name: 'Cryptocurrency', icon: FaBitcoin, processing: '10-30 minutes', fee: '0.1%' }
  ];

  const withdrawalMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, processing: '1-3 business days', fee: 'Free', min: 50, max: 50000 },
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, processing: '3-5 business days', fee: '1%', min: 20, max: 10000 },
    { id: 'paypal', name: 'PayPal', icon: FaPaypal, processing: '24 hours', fee: '2%', min: 10, max: 5000 },
    { id: 'crypto', name: 'Cryptocurrency', icon: FaBitcoin, processing: '1 hour', fee: '0.0005 BTC', min: 50, max: 50000 }
  ];

  const handleDeposit = () => {
    console.log('Deposit:', { method: selectedMethod, amount: depositAmount });
    setShowDeposit(false);
    setDepositAmount('');
  };

  const handleWithdraw = () => {
    console.log('Withdraw:', { method: selectedMethod, amount: withdrawAmount });
    setShowWithdraw(false);
    setWithdrawAmount('');
  };

  const handleDeleteAccount = (id) => {
    console.log('Delete account:', id);
  };

  const handleSetDefaultAccount = (id) => {
    console.log('Set default account:', id);
  };

  // Bank Accounts Section
  const BankAccountsSection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gold-500">Your Bank Accounts</h3>
        <button 
          onClick={() => setShowAddAccount(true)}
          className="px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center space-x-2"
        >
          <FaPlus size={14} />
          <span>Add Bank Account</span>
        </button>
      </div>

      <div className="space-y-4">
        {bankAccounts.map((account) => (
          <div key={account.id} className="bg-navy-700/50 rounded-lg p-4 border border-gold-500/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <FaLandmark className="text-gold-500" />
                  <h4 className="text-white font-medium">{account.bankName}</h4>
                  {account.isVerified && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center">
                      <FaCheck size={10} className="mr-1" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gold-500/70 mt-2">
                  {account.accountName} - {account.accountNumber}
                </p>
                <p className="text-xs text-gold-500/50">
                  Routing: {account.routingNumber} • {account.accountType}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {account.isDefault && (
                  <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
                )}
                {!account.isDefault && (
                  <button 
                    onClick={() => handleSetDefaultAccount(account.id)}
                    className="p-2 text-gold-500/70 hover:text-gold-500"
                    title="Set as Default"
                  >
                    <FaCheck size={14} />
                  </button>
                )}
                <button className="p-2 text-gold-500/70 hover:text-gold-500" title="Edit">
                  <FaEdit size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-2 text-red-400/70 hover:text-red-400" 
                  title="Delete"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bankAccounts.length === 0 && (
        <div className="text-center py-8">
          <FaLandmark className="mx-auto text-gold-500/30 text-4xl mb-3" />
          <p className="text-gold-500/50">No bank accounts added yet</p>
        </div>
      )}
    </div>
  );

  // Credit Cards Section
  const CreditCardsSection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gold-500">Your Credit Cards</h3>
        <button 
          onClick={() => setShowAddCard(true)}
          className="px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center space-x-2"
        >
          <FaPlus size={14} />
          <span>Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {creditCards.map((card) => (
          <div key={card.id} className="bg-gradient-to-br from-navy-700 to-navy-800 rounded-lg p-4 border border-gold-500/30">
            <div className="flex justify-between items-start mb-4">
              <FaCreditCard className="text-gold-500 text-2xl" />
              {card.isDefault && (
                <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
              )}
            </div>
            <p className="text-white font-mono text-lg">•••• •••• •••• {card.last4}</p>
            <p className="text-sm text-gold-500/70 mt-2">{card.cardholderName}</p>
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs text-gold-500/50">Expires {card.expiryDate}</p>
              <p className="text-xs text-green-400">Available: ${card.availableCredit}</p>
            </div>
            {card.isVerified && (
              <div className="mt-2 flex items-center text-xs text-green-400">
                <FaCheck size={10} className="mr-1" /> Verified
              </div>
            )}
          </div>
        ))}
      </div>

      {creditCards.length === 0 && (
        <div className="text-center py-8">
          <FaCreditCard className="mx-auto text-gold-500/30 text-4xl mb-3" />
          <p className="text-gold-500/50">No credit cards added yet</p>
        </div>
      )}
    </div>
  );

  // Payment Methods Section
  const PaymentMethodsSection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
      <h3 className="text-lg font-semibold text-gold-500 mb-6">Your Online Payment Methods</h3>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
            <div className="flex items-center space-x-3">
              {method.method === 'PayPal' && <FaPaypal className="text-blue-400 text-xl" />}
              {method.method === 'Skrill' && <FaMoneyBillWave className="text-orange-400 text-xl" />}
              {method.method === 'Neteller' && <FaMoneyBillWave className="text-green-400 text-xl" />}
              <div>
                <p className="text-white font-medium">{method.method}</p>
                <p className="text-sm text-gold-500/70">{method.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {method.isVerified ? (
                <span className="flex items-center text-xs text-green-400">
                  <FaCheck size={10} className="mr-1" /> Verified
                </span>
              ) : (
                <span className="flex items-center text-xs text-yellow-400">
                  <FaTimes size={10} className="mr-1" /> Unverified
                </span>
              )}
              {method.isDefault && (
                <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
              )}
              <button className="p-2 text-gold-500/70 hover:text-gold-500">
                <FaEdit />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Transaction History Section
  const TransactionHistorySection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
      <div className="p-4 border-b border-gold-500/20">
        <h3 className="text-lg font-semibold text-gold-500">Transaction History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-navy-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">From/To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Reference</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-500/10">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-navy-700/30">
                <td className="px-4 py-3 text-sm text-gold-500/70">{tx.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {tx.type === 'Deposit' && <FaArrowDown className="text-green-400" size={12} />}
                    {tx.type === 'Withdrawal' && <FaArrowUp className="text-red-400" size={12} />}
                    {tx.type === 'Transfer' && <FaExchangeAlt className="text-gold-400" size={12} />}
                    <span className={`text-sm ${
                      tx.type === 'Deposit' ? 'text-green-400' : 
                      tx.type === 'Withdrawal' ? 'text-red-400' : 'text-gold-400'
                    }`}>
                      {tx.type}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-white">${tx.amount}</td>
                <td className="px-4 py-3 text-sm text-gold-500/70">{tx.method}</td>
                <td className="px-4 py-3 text-sm text-gold-500/50">{tx.from} → {tx.to}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
                    tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gold-500/50">{tx.reference}</td>
                <td className="px-4 py-3">
                  <button className="p-1 text-gold-500/70 hover:text-gold-500">
                    <FaDownload size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Banking Navigation */}
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4">
        <div className="flex flex-wrap gap-2">
          {bankingTabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveBankingTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeBankingTab === item.id
                  ? 'bg-gold-500 text-navy-950'
                  : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banking Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wallet Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Wallet Balance Card */}
          <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-lg font-semibold text-gold-500 mb-4 flex items-center">
              <FaWallet className="mr-2" />
              My Wallet
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gold-500/70">Main Wallet Balance</p>
                <p className="text-3xl font-bold text-white">
                  ${walletData.mainWallet.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-navy-700/50 rounded-lg p-3">
                  <p className="text-xs text-gold-500/70">Trading Wallet</p>
                  <p className="text-lg font-semibold text-gold-400">
                    ${walletData.tradingWallet.toLocaleString()}
                  </p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3">
                  <p className="text-xs text-gold-500/70">Bonus Wallet</p>
                  <p className="text-lg font-semibold text-green-400">
                    ${walletData.bonusWallet.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gold-500/20">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Pending Withdrawals</span>
                  <span className="text-yellow-400">${walletData.pendingWithdrawals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gold-500/70">Pending Deposits</span>
                  <span className="text-green-400">${walletData.pendingDeposits}</span>
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => setShowDeposit(true)}
                  className="flex-1 px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all"
                >
                  Deposit
                </button>
                <button 
                  onClick={() => setShowWithdraw(true)}
                  className="flex-1 px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 transition-all"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-md font-semibold text-gold-500 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={onShowTransferModal}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaExchangeAlt className="mr-2 text-gold-500" />
                  Internal Transfer
                </span>
                <FaArrowRight className="text-gold-500/50" />
              </button>
              <button 
                onClick={() => setShowAddAccount(true)}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaCreditCard className="mr-2 text-gold-500" />
                  Add Bank Account
                </span>
                <FaPlus className="text-gold-500/50" />
              </button>
              <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between">
                <span className="flex items-center">
                  <FaFileInvoice className="mr-2 text-gold-500" />
                  Generate Statement
                </span>
                <FaDownload className="text-gold-500/50" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Main Banking Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeBankingTab === 'overview' && (
            <>
              <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
                <h3 className="text-lg font-semibold text-gold-500 mb-4">Banking Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">${walletData.totalBalance}</p>
                    <p className="text-xs text-gold-500/70">Total Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">+$5,250</p>
                    <p className="text-xs text-gold-500/70">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold-400">{transactions.length}</p>
                    <p className="text-xs text-gold-500/70">Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">
                      {transactions.filter(t => t.status === 'Pending').length}
                    </p>
                    <p className="text-xs text-gold-500/70">Pending</p>
                  </div>
                </div>
              </div>
              <TransactionHistorySection />
            </>
          )}

          {activeBankingTab === 'transfer' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-lg font-semibold text-gold-500 mb-4">Internal Transfer</h3>
              <button
                onClick={onShowTransferModal}
                className="px-6 py-3 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600"
              >
                Open Transfer Modal
              </button>
            </div>
          )}

          {activeBankingTab === 'withdraw' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-lg font-semibold text-gold-500 mb-4">Withdrawals</h3>
              <button
                onClick={() => setShowWithdraw(true)}
                className="px-6 py-3 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600"
              >
                Make a Withdrawal
              </button>
            </div>
          )}

          {activeBankingTab === 'accounts' && <BankAccountsSection />}
          {activeBankingTab === 'cards' && <CreditCardsSection />}
          {activeBankingTab === 'payment' && <PaymentMethodsSection />}
          {activeBankingTab === 'history' && <TransactionHistorySection />}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Deposit Funds</h3>
              <button onClick={() => setShowDeposit(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Select Method</label>
                <div className="space-y-2">
                  {depositMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-3 rounded-lg border flex items-center justify-between ${
                        selectedMethod === method.id
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-gold-500/30 bg-navy-700/50 hover:bg-navy-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <method.icon className="text-gold-500 text-xl" />
                        <div className="text-left">
                          <p className="text-white font-medium">{method.name}</p>
                          <p className="text-xs text-gold-500/50">Processing: {method.processing} | Fee: {method.fee}</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && <FaCheck className="text-gold-500" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount)}
                    className="px-3 py-1 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div className="bg-navy-700/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Deposit Amount</span>
                  <span className="text-white font-medium">${depositAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Fee</span>
                  <span className="text-yellow-400">
                    {selectedMethod === 'bank' ? 'Free' : 
                     selectedMethod === 'card' ? '$' + (depositAmount * 0.025).toFixed(2) :
                     selectedMethod === 'paypal' ? '$' + (depositAmount * 0.015).toFixed(2) :
                     '$' + (depositAmount * 0.001).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gold-500/20">
                  <span className="text-gold-500/70">Total to Pay</span>
                  <span className="text-gold-400 font-bold">
                    ${depositAmount ? (depositAmount + 
                      (selectedMethod === 'card' ? depositAmount * 0.025 :
                       selectedMethod === 'paypal' ? depositAmount * 0.015 :
                       selectedMethod === 'crypto' ? depositAmount * 0.001 : 0)).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeposit}
                  className="flex-1 px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600"
                >
                  Confirm Deposit
                </button>
                <button
                  onClick={() => setShowDeposit(false)}
                  className="px-4 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Withdraw Funds</h3>
              <button onClick={() => setShowWithdraw(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-navy-700/30 rounded-lg p-3">
                <p className="text-xs text-gold-500/70">Available Balance</p>
                <p className="text-2xl font-bold text-white">${walletData.mainWallet.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Select Method</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                >
                  {withdrawalMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name} - Min: ${method.min} Max: ${method.max}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    max={walletData.mainWallet}
                    className="w-full pl-8 pr-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setWithdrawAmount(amount)}
                    className="px-3 py-1 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setWithdrawAmount(walletData.mainWallet)}
                className="w-full px-3 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
              >
                Max Amount: ${walletData.mainWallet}
              </button>
              <div className="bg-navy-700/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Withdrawal Amount</span>
                  <span className="text-white font-medium">${withdrawAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Fee</span>
                  <span className="text-yellow-400">
                    {selectedMethod === 'bank' ? 'Free' : 
                     selectedMethod === 'card' ? '$' + (withdrawAmount * 0.01).toFixed(2) :
                     selectedMethod === 'paypal' ? '$' + (withdrawAmount * 0.02).toFixed(2) :
                     '0.0005 BTC'}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gold-500/20">
                  <span className="text-gold-500/70">You'll Receive</span>
                  <span className="text-gold-400 font-bold">
                    ${withdrawAmount ? (withdrawAmount - 
                      (selectedMethod === 'card' ? withdrawAmount * 0.01 :
                       selectedMethod === 'paypal' ? withdrawAmount * 0.02 : 0)).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleWithdraw}
                  className="flex-1 px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600"
                >
                  Confirm Withdrawal
                </button>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="px-4 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Add Bank Account</h3>
              <button onClick={() => setShowAddAccount(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gold-500/70">Feature coming soon...</p>
              <button
                onClick={() => setShowAddAccount(false)}
                className="w-full px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Credit Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Add Credit Card</h3>
              <button onClick={() => setShowAddCard(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gold-500/70">Feature coming soon...</p>
              <button
                onClick={() => setShowAddCard(false)}
                className="w-full px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingTab;