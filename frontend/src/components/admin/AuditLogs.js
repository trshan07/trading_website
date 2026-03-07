// frontend/src/components/admin/AuditLogs.jsx
import React from 'react';
import { FaHistory, FaUser, FaCalendar, FaFilter } from 'react-icons/fa';

const AuditLogs = () => {
  const logs = [
    { id: 1, user: 'Admin', action: 'User Balance Updated', target: 'John Smith', ip: '192.168.1.1', time: '2 minutes ago', details: 'Added $5,000 deposit' },
    { id: 2, user: 'Admin', action: 'Withdrawal Approved', target: 'Sarah Johnson', ip: '192.168.1.1', time: '15 minutes ago', details: 'Approved $2,500 withdrawal' },
    { id: 3, user: 'System', action: 'User Login', target: 'Mike Wilson', ip: '10.0.0.5', time: '25 minutes ago', details: 'Successful login from new device' },
    { id: 4, user: 'Admin', action: 'User Suspended', target: 'David Lee', ip: '192.168.1.1', time: '1 hour ago', details: 'Suspended due to suspicious activity' },
    { id: 5, user: 'System', action: 'Settings Changed', target: 'Trading Parameters', ip: '192.168.1.1', time: '2 hours ago', details: 'Updated leverage limits' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaHistory className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          
          <select className="px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500">
            <option>All Actions</option>
            <option>User Management</option>
            <option>Financial</option>
            <option>System</option>
            <option>Security</option>
          </select>

          <select className="px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>

          <button className="flex items-center px-4 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600">
            <FaFilter className="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-lg border border-navy-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-navy-50">
                <td className="px-6 py-4 text-sm text-navy-600">{log.time}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FaUser className="text-navy-400 mr-2" size={12} />
                    <span className="text-sm font-medium text-navy-900">{log.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-navy-600">{log.action}</td>
                <td className="px-6 py-4 text-sm text-navy-600">{log.target}</td>
                <td className="px-6 py-4 text-sm text-navy-600">{log.ip}</td>
                <td className="px-6 py-4 text-sm text-navy-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 bg-navy-50 border-t border-navy-100 flex items-center justify-between">
          <p className="text-sm text-navy-600">Showing 1 to 5 of 1,234 logs</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-navy-200 rounded-lg hover:bg-navy-200">Previous</button>
            <button className="px-3 py-1 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600">1</button>
            <button className="px-3 py-1 border border-navy-200 rounded-lg hover:bg-navy-200">2</button>
            <button className="px-3 py-1 border border-navy-200 rounded-lg hover:bg-navy-200">3</button>
            <button className="px-3 py-1 border border-navy-200 rounded-lg hover:bg-navy-200">Next</button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Export Audit Logs</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-navy-200 rounded-lg hover:bg-navy-50 flex items-center space-x-2">
            <FaFilePdf className="text-red-500" />
            <span>Export as PDF</span>
          </button>
          <button className="px-4 py-2 border border-navy-200 rounded-lg hover:bg-navy-50 flex items-center space-x-2">
            <FaFileExcel className="text-green-600" />
            <span>Export as Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;