// frontend/src/components/dashboard/DocumentsTab.jsx
import React, { useState, useEffect } from 'react';
import { FaUpload, FaFilePdf, FaDownload, FaEye, FaFileAlt, FaFileImage, FaFileWord, FaFileExcel } from 'react-icons/fa';

const DocumentsTab = ({ documents, onUpload }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (type) => {
    switch(type) {
      case 'PDF': return <FaFilePdf className="text-red-400 text-lg sm:text-xl" />;
      case 'JPG':
      case 'PNG':
      case 'JPEG': return <FaFileImage className="text-blue-400 text-lg sm:text-xl" />;
      case 'DOC':
      case 'DOCX': return <FaFileWord className="text-blue-600 text-lg sm:text-xl" />;
      case 'XLS':
      case 'XLSX': return <FaFileExcel className="text-green-600 text-lg sm:text-xl" />;
      default: return <FaFileAlt className="text-gold-500 text-lg sm:text-xl" />;
    }
  };

  const categories = ['all', 'Identity Proof', 'Address Proof', 'Income Proof', 'Bank Statement', 'Tax Document'];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
        {/* Title and Upload Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gold-500">My Documents</h3>
          <button 
            onClick={onUpload}
            className="w-full sm:w-auto px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <FaUpload size={isMobile ? 14 : 16} />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Search and Filter - Mobile */}
        {isMobile && (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Document Statistics Cards - Responsive Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="bg-navy-700/30 rounded-lg p-2 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-green-400">
              {documents.filter(d => d.status === 'Verified').length}
            </p>
            <p className="text-xs sm:text-sm text-gold-500/70">Verified</p>
          </div>
          <div className="bg-navy-700/30 rounded-lg p-2 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-yellow-400">
              {documents.filter(d => d.status === 'Pending').length}
            </p>
            <p className="text-xs sm:text-sm text-gold-500/70">Pending</p>
          </div>
          <div className="bg-navy-700/30 rounded-lg p-2 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-gold-400">{documents.length}</p>
            <p className="text-xs sm:text-sm text-gold-500/70">Total</p>
          </div>
        </div>

        {/* Search and Filter - Desktop */}
        {!isMobile && (
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-700 text-gold-500/70 hover:text-gold-500'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Documents List - Mobile Card View */}
        {isMobile && (
          <div className="space-y-3">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-navy-700/30 rounded-lg p-3 border border-gold-500/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1">
                      {getFileIcon(doc.type)}
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium truncate max-w-[150px]">{doc.name}</p>
                        <p className="text-xs text-gold-500/50">{doc.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      doc.status === 'Verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-gold-500/50">Type</p>
                      <p className="text-white">{doc.type}</p>
                    </div>
                    <div>
                      <p className="text-gold-500/50">Size</p>
                      <p className="text-white">{doc.size}</p>
                    </div>
                    <div>
                      <p className="text-gold-500/50">Date</p>
                      <p className="text-white">{doc.uploadDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button className="p-2 bg-navy-600 rounded-lg text-gold-500/70 hover:text-gold-500">
                      <FaEye size={14} />
                    </button>
                    <button className="p-2 bg-navy-600 rounded-lg text-gold-500/70 hover:text-gold-500">
                      <FaDownload size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaFileAlt className="mx-auto text-gold-500/30 text-4xl mb-3" />
                <p className="text-gold-500/50 text-sm">No documents found</p>
              </div>
            )}
          </div>
        )}

        {/* Documents Table - Desktop View */}
        {!isMobile && (
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
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-navy-700/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(doc.type)}
                          <span className="text-sm text-white">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gold-500/70">{doc.category}</td>
                      <td className="px-4 py-3 text-sm text-gold-500/70">{doc.type}</td>
                      <td className="px-4 py-3 text-sm text-gold-500/70">{doc.size}</td>
                      <td className="px-4 py-3 text-sm text-gold-500/70">{doc.uploadDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          doc.status === 'Verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button className="p-1 text-gold-500/70 hover:text-gold-500">
                            <FaEye size={14} />
                          </button>
                          <button className="p-1 text-gold-500/70 hover:text-gold-500">
                            <FaDownload size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <FaFileAlt className="text-gold-500/30 text-4xl mb-3" />
                        <p className="text-gold-500/50 text-sm">No documents found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Footer */}
        <div className="mt-4 pt-4 border-t border-gold-500/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-gold-500/50">
            <span>Showing {filteredDocuments.length} of {documents.length} documents</span>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Upload Guidelines Section */}
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
        <h4 className="text-sm sm:text-md font-semibold text-gold-500 mb-3">Document Upload Guidelines</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-500 text-xs sm:text-sm">1</span>
            </div>
            <p className="text-xs sm:text-sm text-gold-500/70">Accepted formats: PDF, JPG, PNG (Max 10MB)</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-500 text-xs sm:text-sm">2</span>
            </div>
            <p className="text-xs sm:text-sm text-gold-500/70">Documents must be clear and legible</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-500 text-xs sm:text-sm">3</span>
            </div>
            <p className="text-xs sm:text-sm text-gold-500/70">Verification takes 1-2 business days</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-500 text-xs sm:text-sm">4</span>
            </div>
            <p className="text-xs sm:text-sm text-gold-500/70">All documents are securely encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;