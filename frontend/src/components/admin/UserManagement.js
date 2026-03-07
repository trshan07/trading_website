// frontend/src/components/admin/UserManagement.jsx
import React, { useState } from 'react';
import { FaSearch, FaFilter, FaEdit, FaBan, FaCheckCircle, FaExclamationCircle, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';

const UserManagement = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const users = [
    { 
      id: 1, 
      name: 'John Smith', 
      email: 'john.smith@email.com',
      accountType: 'Premium',
      balance: '$25,450.00',
      trades: 145,
      status: 'active',
      verified: true,
      joined: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      email: 'sarah.j@email.com',
      accountType: 'Standard',
      balance: '$8,230.50',
      trades: 67,
      status: 'active',
      verified: true,
      joined: '2024-02-20'
    },
    { 
      id: 3, 
      name: 'Mike Wilson', 
      email: 'mike.w@email.com',
      accountType: 'Basic',
      balance: '$1,200.00',
      trades: 23,
      status: 'inactive',
      verified: false,
      joined: '2024-03-10'
    },
    { 
      id: 4, 
      name: 'Emma Brown', 
      email: 'emma.b@email.com',
      accountType: 'Premium',
      balance: '$67,890.00',
      trades: 234,
      status: 'active',
      verified: true,
      joined: '2023-11-05'
    },
    { 
      id: 5, 
      name: 'David Lee', 
      email: 'david.l@email.com',
      accountType: 'Standard',
      balance: '$12,450.00',
      trades: 89,
      status: 'suspended',
      verified: true,
      joined: '2024-01-28'
    },
  ];

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      suspended: 'bg-red-100 text-red-700'
    };
    return styles[status] || styles.inactive;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-navy-900">User Management</h1>
        <div className="flex gap-3">
          <button className="bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-semibold hover:bg-gold-600 transition-colors">
            + Add New User
          </button>
          <button className="border border-navy-300 text-navy-700 px-6 py-2 rounded-lg font-semibold hover:bg-navy-50 transition-colors">
            Export List
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or ID..."
                className="w-full pl-12 pr-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select className="border border-navy-200 rounded-lg px-4 py-3 text-navy-700 focus:border-gold-500 focus:outline-none">
              <option>All Account Types</option>
              <option>Premium</option>
              <option>Standard</option>
              <option>Basic</option>
            </select>
            
            <select className="border border-navy-200 rounded-lg px-4 py-3 text-navy-700 focus:border-gold-500 focus:outline-none">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>
            
            <button className="flex items-center gap-2 border border-navy-200 rounded-lg px-4 py-3 text-navy-700 hover:bg-navy-50">
              <FaFilter />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={handleSelectAll}
                    className="rounded border-navy-300 text-gold-500 focus:ring-gold-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Account Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Trades</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-navy-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-navy-300 text-gold-500 focus:ring-gold-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-navy-600 to-navy-700 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-navy-900">{user.name}</p>
                        <p className="text-sm text-navy-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${user.accountType === 'Premium' ? 'bg-gold-100 text-gold-700' : ''}
                      ${user.accountType === 'Standard' ? 'bg-blue-100 text-blue-700' : ''}
                      ${user.accountType === 'Basic' ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {user.accountType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-navy-900">{user.balance}</td>
                  <td className="px-6 py-4 text-navy-600">{user.trades}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.verified ? (
                      <FaCheckCircle className="text-green-500 text-xl" />
                    ) : (
                      <FaExclamationCircle className="text-yellow-500 text-xl" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-navy-600">{user.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-navy-600 hover:text-gold-500 transition-colors" title="View">
                        <FaEye />
                      </button>
                      <button className="p-2 text-navy-600 hover:text-gold-500 transition-colors" title="Edit">
                        <FaEdit />
                      </button>
                      <button className="p-2 text-navy-600 hover:text-red-500 transition-colors" title="Suspend">
                        <FaBan />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-between">
          <p className="text-sm text-navy-600">Showing 1 to 5 of 50 users</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-navy-200 rounded-lg text-navy-600 hover:bg-navy-50">Previous</button>
            <button className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg font-semibold">1</button>
            <button className="px-4 py-2 border border-navy-200 rounded-lg text-navy-600 hover:bg-navy-50">2</button>
            <button className="px-4 py-2 border border-navy-200 rounded-lg text-navy-600 hover:bg-navy-50">3</button>
            <button className="px-4 py-2 border border-navy-200 rounded-lg text-navy-600 hover:bg-navy-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;