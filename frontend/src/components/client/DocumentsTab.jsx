// frontend/src/components/dashboard/DocumentsTab.jsx
import React from 'react';
import { FaUpload, FaFilePdf, FaDownload, FaEye } from 'react-icons/fa';

const DocumentsTab = ({ documents, onUpload }) => {
  return (
    <div className="space-y-6">
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gold-500">My Documents</h3>
          <button 
            onClick={onUpload}
            className="px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center space-x-2"
          >
            <FaUpload />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Document Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-navy-700/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {documents.filter(d => d.status === 'Verified').length}
            </p>
            <p className="text-sm text-gold-500/70">Verified</p>
          </div>
          <div className="bg-navy-700/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {documents.filter(d => d.status === 'Pending').length}
            </p>
            <p className="text-sm text-gold-500/70">Pending</p>
          </div>
          <div className="bg-navy-700/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gold-400">{documents.length}</p>
            <p className="text-sm text-gold-500/70">Total Documents</p>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Document Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Upload Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/10">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-navy-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {doc.type === 'PDF' && <FaFilePdf className="text-red-400" />}
                      <span className="text-sm text-white">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{doc.category}</td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{doc.type}</td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{doc.size}</td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{doc.uploadDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doc.status === 'Verified' ? 'bg-green-500/20 text-green-400' : 
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gold-500/70 hover:text-gold-500">
                        <FaDownload size={14} />
                      </button>
                      <button className="p-1 text-gold-500/70 hover:text-gold-500">
                        <FaEye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;