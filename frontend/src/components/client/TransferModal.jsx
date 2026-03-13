// frontend/src/components/dashboard/TransferModal.jsx
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const TransferModal = ({ isOpen, onClose, walletData, onConfirm }) => {
  const [fromAccount, setFromAccount] = useState('wallet');
  const [toAccount, setToAccount] = useState('trading');
  const [transferAmount, setTransferAmount] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ from: fromAccount, to: toAccount, amount: transferAmount });
    onClose();
    setTransferAmount('');
  };

  return (
    <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gold-500">Internal Transfer</h3>
          <button
            onClick={onClose}
            className="text-gold-500/70 hover:text-gold-500"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* From Section */}
          <div>
            <label className="block text-sm text-gold-500/70 mb-3">From</label>
            <div className="space-y-3">
              <div className="flex items-center p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
                <input
                  type="radio"
                  name="from"
                  value="wallet"
                  checked={fromAccount === 'wallet'}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="mr-3 accent-gold-500"
                />
                <div className="flex-1">
                  <p className="text-white font-medium">My Wallet (USD)</p>
                  <p className="text-sm text-gold-500/70">Current Balance: ${walletData.mainWallet}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
                <input
                  type="radio"
                  name="from"
                  value="trading"
                  checked={fromAccount === 'trading'}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="mr-3 accent-gold-500"
                />
                <div className="flex-1">
                  <p className="text-white font-medium">My Trading Accounts</p>
                  <p className="text-sm text-gold-500/70">Available Balance: ${walletData.tradingWallet}</p>
                </div>
              </div>
            </div>
          </div>

          {/* To Section */}
          <div>
            <label className="block text-sm text-gold-500/70 mb-3">To</label>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
            >
              <option value="trading">Trading Account (MT5)</option>
              <option value="wallet">Main Wallet</option>
              <option value="bonus">Bonus Wallet</option>
            </select>
          </div>

          {/* Amount to Transfer */}
          <div>
            <label className="block text-sm text-gold-500/70 mb-2">Amount to Transfer (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500">$</span>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {[100, 500, 1000, 5000, 10000].map((amount) => (
              <button
                key={amount}
                onClick={() => setTransferAmount(amount)}
                className="px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Transfer Summary */}
          <div className="bg-navy-700/50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gold-500/70">Transfer Amount</span>
              <span className="text-white font-medium">${transferAmount || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gold-500/70">Transfer Fee</span>
              <span className="text-green-400">Free</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gold-500/20">
              <span className="text-gold-500/70">You'll Receive</span>
              <span className="text-gold-400 font-bold">${transferAmount || '0.00'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 transition-all"
            >
              Confirm Transfer
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;