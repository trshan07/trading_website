// frontend/src/components/admin/Reports.jsx
import React from 'react';
import { FaFilePdf, FaFileExcel, FaChartBar, FaDownload } from 'react-icons/fa';

const Reports = () => {
  const reports = [
    { name: 'Daily Trading Report', date: '2024-03-15', size: '2.4 MB', type: 'PDF' },
    { name: 'User Activity Summary', date: '2024-03-15', size: '1.8 MB', type: 'Excel' },
    { name: 'Financial Statement', date: '2024-03-14', size: '3.2 MB', type: 'PDF' },
    { name: 'Monthly Performance', date: '2024-03-01', size: '4.5 MB', type: 'PDF' },
  ];

  return (
    <div className="space-y-6">
      {/* Report Generation Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500">
            <option>Report Type</option>
            <option>Trading Report</option>
            <option>User Activity</option>
            <option>Financial Summary</option>
            <option>Compliance Report</option>
          </select>
          <select className="px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-gold-500">
            <option>Time Period</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Custom Range</option>
          </select>
          <button className="bg-gold-500 text-navy-900 px-4 py-2 rounded-lg hover:bg-gold-600 flex items-center justify-center space-x-2">
            <FaChartBar />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {reports.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
              <div className="flex items-center space-x-3">
                {report.type === 'PDF' ? (
                  <FaFilePdf className="text-red-500" size={20} />
                ) : (
                  <FaFileExcel className="text-green-600" size={20} />
                )}
                <div>
                  <p className="text-sm font-medium text-navy-900">{report.name}</p>
                  <p className="text-xs text-navy-500">Generated: {report.date} • {report.size}</p>
                </div>
              </div>
              <button className="p-2 text-navy-600 hover:text-gold-500">
                <FaDownload size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-navy-100">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Scheduled Reports</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-navy-900">Daily Trading Summary</p>
              <p className="text-xs text-navy-500">Every day at 23:59</p>
            </div>
            <button className="text-red-500 hover:text-red-600 text-sm">Disable</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-navy-900">Weekly User Report</p>
              <p className="text-xs text-navy-500">Every Monday at 09:00</p>
            </div>
            <button className="text-red-500 hover:text-red-600 text-sm">Disable</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;