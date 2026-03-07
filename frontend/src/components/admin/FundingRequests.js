// frontend/src/components/admin/FundingRequests.jsx
import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaDownload, FaEye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FundingRequests = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const requests = {
    pending: [
      { 
        id: 1, 
        user: 'John Smith',
        type: 'deposit',
        amount: '$5,000.00',
        method: 'Bank Transfer',
        reference: 'DEP-2024-001',
        date: '2024-03-15 10:30 AM',
        proof: 'proof_001.pdf'
      },
      { 
        id: 2, 
        user: 'Sarah Johnson',
        type: 'withdrawal',
        amount: '$2,500.00',
        method: 'Wire Transfer',
        reference: 'WTH-2024-002',
        date: '2024-03-15 09:15 AM',
        accountDetails: '****1234'
      },
    ],
    approved: [
      { 
        id: 3, 
        user: 'Mike Wilson',
        type: 'deposit',
        amount: '$1,200.00',
        method: 'Credit Card',
        reference: 'DEP-2024-003',
        date: '2024-03-14 14:20 PM',
        processedBy: 'Admin',
        processedDate: '2024-03-14 15:30 PM'
      },
    ],
    rejected: [
      { 
        id: 4, 
        user: 'Emma Brown',
        type: 'withdrawal',
        amount: '$10,000.00',
        method: 'Bank Transfer',
        reference: 'WTH-2024-004',
        date: '2024-03-13 11:45 AM',
        reason: 'Insufficient funds'
      },
    ]
  };

  const getTypeBadge = (type) => {
    return type === 'deposit' 
      ? 'bg-green-100 text-green-700'
      : 'bg-blue-100 text-blue-700';
  };

  const handleApprove = (request) => {
    console.log('Approving:', request);
  };

  const handleReject = (request) => {
    console.log('Rejecting:', request);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-navy-900">Funding Requests</h1>
        <div className="flex gap-3">
          <select className="border border-navy-200 rounded-lg px-4 py-2 text-navy-700 focus:border-gold-500 focus:outline-none">
            <option>All Methods</option>
            <option>Bank Transfer</option>
            <option>Credit Card</option>
            <option>Wire Transfer</option>
          </select>
          <button className="bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-semibold hover:bg-gold-600 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy-500 text-sm">Total Pending</p>
              <p className="text-2xl font-bold text-navy-900">12</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy-500 text-sm">Approved Today</p>
              <p className="text-2xl font-bold text-navy-900">8</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy-500 text-sm">Total Deposits</p>
              <p className="text-2xl font-bold text-navy-900">$45,678</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaDownload className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy-500 text-sm">Total Withdrawals</p>
              <p className="text-2xl font-bold text-navy-900">$23,456</p>
            </div>
            <div className="p-3 bg-gold-100 rounded-lg">
              <FaDownload className="text-gold-600 text-xl rotate-180" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-navy-100">
          <nav className="flex">
            {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize transition-colors relative
                  ${activeTab === tab 
                    ? 'text-gold-500' 
                    : 'text-navy-600 hover:text-navy-900'
                  }`}
              >
                {tab}
                {tab === 'pending' && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    12
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase">Proof</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {requests[activeTab].map((request) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-navy-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-navy-600">{request.reference}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-navy-900">{request.user}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getTypeBadge(request.type)}`}>
                      {request.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-navy-900">{request.amount}</span>
                  </td>
                  <td className="px-6 py-4 text-navy-600">{request.method}</td>
                  <td className="px-6 py-4 text-navy-500 text-sm">{request.date}</td>
                  <td className="px-6 py-4">
                    {request.proof ? (
                      <button className="flex items-center gap-2 text-gold-500 hover:text-gold-600">
                        <FaEye size={16} />
                        <span className="text-sm">View</span>
                      </button>
                    ) : (
                      <span className="text-navy-400 text-sm">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {activeTab === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Approve"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Reject"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    )}
                    {activeTab === 'approved' && (
                      <span className="text-sm text-navy-500">Processed by {request.processedBy}</span>
                    )}
                    {activeTab === 'rejected' && (
                      <span className="text-sm text-red-500">{request.reason}</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FundingRequests;