// frontend/src/pages/admin/FundingRequestsPage.jsx
import React, { useState } from 'react';
import { FaCheck, FaTimes, FaEye, FaDownload } from 'react-icons/fa';

const FundingRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const requests = {
    pending: [
      { id: 'DEP001', user: 'John Smith', amount: '$5,000', method: 'Bank Transfer', date: '2024-03-15', proof: 'receipt1.pdf' },
      { id: 'DEP002', user: 'Sarah Johnson', amount: '$2,500', method: 'Credit Card', date: '2024-03-15', proof: 'receipt2.pdf' },
      { id: 'DEP003', user: 'Mike Wilson', amount: '$10,000', method: 'Crypto', date: '2024-03-14', proof: 'txn_hash_123' },
    ],
    approved: [
      { id: 'DEP004', user: 'Emma Brown', amount: '$3,200', method: 'Bank Transfer', date: '2024-03-13', approvedBy: 'Admin' },
      { id: 'DEP005', user: 'David Lee', amount: '$7,500', method: 'Credit Card', date: '2024-03-12', approvedBy: 'Admin' },
    ],
    rejected: [
      { id: 'DEP006', user: 'Tom Harris', amount: '$1,000', method: 'Crypto', date: '2024-03-11', reason: 'Invalid proof' },
    ]
  };

  const getMethodColor = (method) => {
    switch(method) {
      case 'Bank Transfer': return 'bg-blue-100 text-blue-700';
      case 'Credit Card': return 'bg-purple-100 text-purple-700';
      case 'Crypto': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-navy-900">Funding Requests</h1>
        <div className="flex space-x-2">
          <button className="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors">
            Export Report
          </button>
          <button className="bg-gold-500 text-navy-900 px-4 py-2 rounded-lg hover:bg-gold-600 transition-colors">
            Settings
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
          <p className="text-sm text-navy-500">Total Requests</p>
          <p className="text-2xl font-bold text-navy-900">156</p>
          <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
          <p className="text-sm text-navy-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">23</p>
          <p className="text-xs text-navy-500 mt-2">Requires attention</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
          <p className="text-sm text-navy-500">Approved (Today)</p>
          <p className="text-2xl font-bold text-green-600">12</p>
          <p className="text-xs text-navy-500 mt-2">Total: $45,230</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
          <p className="text-sm text-navy-500">Total Volume</p>
          <p className="text-2xl font-bold text-navy-900">$1.2M</p>
          <p className="text-xs text-navy-500 mt-2">This month</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-navy-100 overflow-hidden">
        <div className="border-b border-navy-100">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-gold-500 text-gold-500'
                    : 'border-transparent text-navy-500 hover:text-navy-700 hover:border-navy-300'
                }`}
              >
                {tab} ({requests[tab].length})
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-navy-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Proof</th>
              {activeTab !== 'pending' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  {activeTab === 'approved' ? 'Approved By' : 'Reason'}
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {requests[activeTab].map((request) => (
              <tr key={request.id} className="hover:bg-navy-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-navy-900">{request.id}</td>
                <td className="px-6 py-4 text-sm text-navy-600">{request.user}</td>
                <td className="px-6 py-4 text-sm font-medium text-navy-900">{request.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(request.method)}`}>
                    {request.method}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-navy-600">{request.date}</td>
                <td className="px-6 py-4">
                  <button className="flex items-center text-gold-500 hover:text-gold-600">
                    <FaDownload className="mr-1" size={12} />
                    <span className="text-xs">{request.proof}</span>
                  </button>
                </td>
                {activeTab !== 'pending' && (
                  <td className="px-6 py-4 text-sm text-navy-600">
                    {request.approvedBy || request.reason}
                  </td>
                )}
                <td className="px-6 py-4">
                  {activeTab === 'pending' ? (
                    <div className="flex space-x-2">
                      <button className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Approve">
                        <FaCheck size={16} />
                      </button>
                      <button className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Reject">
                        <FaTimes size={16} />
                      </button>
                      <button className="p-1 bg-navy-100 text-navy-700 rounded hover:bg-navy-200" title="View Details">
                        <FaEye size={16} />
                      </button>
                    </div>
                  ) : (
                    <button className="p-1 bg-navy-100 text-navy-700 rounded hover:bg-navy-200">
                      <FaEye size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Action Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-navy-50 rounded-lg">
            <h3 className="font-medium text-navy-900 mb-2">Bulk Approve</h3>
            <p className="text-sm text-navy-600 mb-3">Approve multiple pending requests at once</p>
            <button className="text-gold-500 hover:text-gold-600 text-sm font-medium">Select Requests →</button>
          </div>
          <div className="p-4 bg-navy-50 rounded-lg">
            <h3 className="font-medium text-navy-900 mb-2">Manual Adjustment</h3>
            <p className="text-sm text-navy-600 mb-3">Manually adjust user balance</p>
            <button className="text-gold-500 hover:text-gold-600 text-sm font-medium">Adjust Balance →</button>
          </div>
          <div className="p-4 bg-navy-50 rounded-lg">
            <h3 className="font-medium text-navy-900 mb-2">Generate Report</h3>
            <p className="text-sm text-navy-600 mb-3">Download funding report for accounting</p>
            <button className="text-gold-500 hover:text-gold-600 text-sm font-medium">Generate →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingRequestsPage;