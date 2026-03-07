// frontend/src/components/admin/BalanceAdjustment.jsx
import React, { useState } from 'react';
import { FaPlus, FaMinus, FaCheck } from 'react-icons/fa';

const BalanceAdjustment = ({ user, onClose, onAdjust }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('credit');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle balance adjustment
    console.log({ user, type, amount, reason });
    onAdjust({ user, type, amount, reason });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Balance Adjustment</h2>
        <p className="text-sm text-navy-600 mb-6">
          Adjusting balance for: <span className="font-semibold">{user?.name}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Adjustment Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center space-x-2 ${
                  type === 'credit'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'border-navy-200 text-navy-700 hover:bg-navy-50'
                }`}
              >
                <FaPlus size={14} />
                <span>Credit</span>
              </button>
              <button
                type="button"
                onClick={() => setType('debit')}
                className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center space-x-2 ${
                  type === 'debit'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'border-navy-200 text-navy-700 hover:bg-navy-50'
                }`}
              >
                <FaMinus size={14} />
                <span>Debit</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Reason for Adjustment
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500"
              placeholder="Enter reason for this adjustment"
              rows="3"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gold-500 text-navy-900 py-2 px-4 rounded-lg hover:bg-gold-600 transition-colors flex items-center justify-center space-x-2"
            >
              <FaCheck size={16} />
              <span>Confirm Adjustment</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-navy-100 text-navy-700 py-2 px-4 rounded-lg hover:bg-navy-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BalanceAdjustment;