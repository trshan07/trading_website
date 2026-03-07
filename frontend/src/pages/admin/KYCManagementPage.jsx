// frontend/src/pages/admin/KYCManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaIdCard,
  FaPassport,
  FaFileInvoice,
  FaCheck,
  FaTimes,
  FaEye,
  FaDownload,
  FaEnvelope,
  FaBan,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaCalendarAlt
} from 'react-icons/fa';

const KYCManagementPage = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock KYC data
    const mockKYC = [
      {
        id: 1,
        userId: 101,
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        documents: {
          idType: 'passport',
          idNumber: 'P123456789',
          frontImage: '/mock/passport-front.jpg',
          backImage: '/mock/passport-back.jpg',
          selfie: '/mock/selfie.jpg',
          proofOfAddress: '/mock/bill.pdf'
        },
        status: 'pending',
        submittedAt: '2024-03-07T10:30:00',
        riskScore: 65,
        country: 'Canada',
        dateOfBirth: '1990-05-15',
        address: '123 Main St, Toronto, ON',
        phone: '+1 416-555-0123',
        notes: ''
      },
      {
        id: 2,
        userId: 102,
        name: 'Michael Chen',
        email: 'michael.c@example.com',
        documents: {
          idType: 'drivers_license',
          idNumber: 'DL987654321',
          frontImage: '/mock/license-front.jpg',
          backImage: '/mock/license-back.jpg',
          selfie: '/mock/selfie2.jpg',
          proofOfAddress: '/mock/bill2.pdf'
        },
        status: 'approved',
        submittedAt: '2024-03-06T15:20:00',
        approvedAt: '2024-03-07T09:15:00',
        approvedBy: 'Admin User',
        riskScore: 35,
        country: 'USA',
        dateOfBirth: '1985-08-22',
        address: '456 Oak Ave, New York, NY',
        phone: '+1 212-555-0123',
        notes: 'All documents verified'
      },
      {
        id: 3,
        userId: 103,
        name: 'Emma Wilson',
        email: 'emma.w@example.com',
        documents: {
          idType: 'national_id',
          idNumber: 'ID456789123',
          frontImage: '/mock/id-front.jpg',
          backImage: '/mock/id-back.jpg',
          selfie: '/mock/selfie3.jpg',
          proofOfAddress: '/mock/bill3.pdf'
        },
        status: 'rejected',
        submittedAt: '2024-03-05T11:45:00',
        rejectedAt: '2024-03-06T14:30:00',
        rejectedBy: 'Admin User',
        rejectionReason: 'Document quality insufficient',
        riskScore: 85,
        country: 'UK',
        dateOfBirth: '1992-11-30',
        address: '789 High St, London, UK',
        phone: '+44 20 7123 4567',
        notes: 'Requested better quality images'
      }
    ];

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKycRequests(mockKYC);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejected</span>;
      default:
        return null;
    }
  };

  const getDocumentIcon = (type) => {
    switch(type) {
      case 'passport':
        return <FaPassport className="text-blue-500" size={24} />;
      case 'drivers_license':
        return <FaIdCard className="text-green-500" size={24} />;
      case 'national_id':
        return <FaFileInvoice className="text-purple-500" size={24} />;
      default:
        return <FaIdCard className="text-gray-500" size={24} />;
    }
  };

  const filteredRequests = kycRequests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || req.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KYC Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Verify customer identities and documents
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FaDownload className="inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            </div>
            <FaUserCheck className="text-blue-500" size={28} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">45</p>
            </div>
            <FaUserClock className="text-yellow-500" size={28} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-600">1,089</p>
            </div>
            <FaUserCheck className="text-green-500" size={28} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600">100</p>
            </div>
            <FaUserTimes className="text-red-500" size={28} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time</p>
              <p className="text-2xl font-bold text-purple-600">2.5h</p>
            </div>
            <FaCalendarAlt className="text-purple-500" size={28} />
          </div>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Document Types</option>
            <option>Passport</option>
            <option>Driver's License</option>
            <option>National ID</option>
          </select>

          <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <FaFilter className="mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* KYC Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Risk Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{request.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{request.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {getDocumentIcon(request.documents.idType)}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {request.documents.idType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(request.submittedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.riskScore < 40 ? 'bg-green-100 text-green-800' :
                    request.riskScore < 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.riskScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="text-blue-600 hover:text-blue-700 mr-3"
                  >
                    <FaEye size={16} />
                  </button>
                  <button className="text-green-600 hover:text-green-700 mr-3">
                    <FaCheck size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <FaTimes size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KYC Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">KYC Verification Review</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Personal Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-sm text-gray-500">Full Name:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.name}</span></p>
                    <p><span className="text-sm text-gray-500">Date of Birth:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.dateOfBirth}</span></p>
                    <p><span className="text-sm text-gray-500">Country:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.country}</span></p>
                    <p><span className="text-sm text-gray-500">Address:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.address}</span></p>
                    <p><span className="text-sm text-gray-500">Phone:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.phone}</span></p>
                    <p><span className="text-sm text-gray-500">Email:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.email}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Document Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-sm text-gray-500">Document Type:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.documents.idType}</span></p>
                    <p><span className="text-sm text-gray-500">Document Number:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.documents.idNumber}</span></p>
                    <p><span className="text-sm text-gray-500">Submitted:</span> <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selectedRequest.submittedAt).toLocaleString()}</span></p>
                    <p><span className="text-sm text-gray-500">Risk Score:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedRequest.riskScore < 40 ? 'bg-green-100 text-green-800' :
                        selectedRequest.riskScore < 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedRequest.riskScore}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Documents</h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Front ID</p>
                  <div className="bg-gray-100 dark:bg-gray-700 h-48 rounded-lg flex items-center justify-center">
                    <img src={selectedRequest.documents.frontImage} alt="Front ID" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Back ID</p>
                  <div className="bg-gray-100 dark:bg-gray-700 h-48 rounded-lg flex items-center justify-center">
                    <img src={selectedRequest.documents.backImage} alt="Back ID" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selfie</p>
                  <div className="bg-gray-100 dark:bg-gray-700 h-48 rounded-lg flex items-center justify-center">
                    <img src={selectedRequest.documents.selfie} alt="Selfie" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proof of Address</p>
                  <div className="bg-gray-100 dark:bg-gray-700 h-48 rounded-lg flex items-center justify-center">
                    <FaFileInvoice className="text-gray-400" size={48} />
                  </div>
                </div>
              </div>

              {/* Notes and Actions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Notes
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add notes about this verification..."
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                  Request Resubmission
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Reject
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Approve & Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCManagementPage;