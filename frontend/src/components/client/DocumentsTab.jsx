// frontend/src/components/dashboard/DocumentsTab.jsx
import React, { useState, useEffect } from 'react';
import { FaUpload, FaFilePdf, FaDownload, FaEye, FaFileAlt, FaFileImage, FaFileWord, FaFileExcel, FaShieldAlt } from 'react-icons/fa';

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Secure Vault</h3>
            <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-[0.3em]">Compliance & Identity Records</p>
          </div>
          <button 
            onClick={onUpload}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-gold-600 shadow-2xl shadow-slate-900/10 transition-all font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center space-x-3 group"
          >
            <FaUpload size={12} className="text-gold-500 group-hover:text-white transition-colors" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Document Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-emerald-500/5 rounded-[2rem] p-8 border border-emerald-500/10 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
            <p className="text-4xl font-black text-emerald-600 italic tracking-tighter relative">
              {documents.filter(d => d.status === 'Verified').length}
            </p>
            <p className="text-[9px] uppercase font-black text-emerald-600/60 tracking-[0.3em] mt-2 relative">Verified Assets</p>
          </div>
          <div className="bg-gold-500/5 rounded-[2rem] p-8 border border-gold-500/10 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
            <p className="text-4xl font-black text-gold-600 italic tracking-tighter relative">
              {documents.filter(d => d.status === 'Pending').length}
            </p>
            <p className="text-[9px] uppercase font-black text-gold-600/60 tracking-[0.3em] mt-2 relative">Review Pending</p>
          </div>
          <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl shadow-slate-900/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
            <p className="text-4xl font-black text-white italic tracking-tighter relative">{documents.length}</p>
            <p className="text-[9px] uppercase font-black text-slate-500 tracking-[0.3em] mt-2 relative">Total Archive</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-10 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100">
          <div className="relative w-full xl:max-w-md">
            <input
              type="text"
              placeholder="Filter vault archive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-900 text-xs font-black italic focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner placeholder-slate-300"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500">
              <FaFileAlt size={14} />
            </div>
          </div>
          <div className="flex gap-3 w-full xl:w-auto overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20'
                    : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-900 hover:text-slate-900 shadow-sm'
                }`}
              >
                {cat === 'all' ? 'Entire Vault' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Content */}
        {filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] uppercase font-black text-slate-400 tracking-[0.25em]">
                  <th className="px-8 py-4 text-left font-black">Document Name</th>
                  {!isMobile && (
                    <>
                      <th className="px-8 py-4 text-left font-black">Category</th>
                      <th className="px-8 py-4 text-left font-black">Format</th>
                      <th className="px-8 py-4 text-right font-black">Size</th>
                      <th className="px-8 py-4 text-right font-black">Timestamp</th>
                    </>
                  )}
                  <th className="px-8 py-4 text-center font-black">Status</th>
                  <th className="px-8 py-4 text-center font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="group bg-slate-50/30 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1">
                    <td className="px-8 py-6 rounded-l-[2rem] border-y border-l border-slate-50 group-hover:border-gold-500/20">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-50 group-hover:border-gold-500/20 transition-colors">
                          {getFileIcon(doc.type)}
                        </div>
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight italic">{doc.name}</span>
                      </div>
                    </td>
                    {!isMobile && (
                      <>
                        <td className="px-8 py-6 text-[10px] font-black text-slate-500 border-y border-slate-50 group-hover:border-gold-500/20 uppercase tracking-widest">{doc.category}</td>
                        <td className="px-8 py-6 text-[10px] font-black text-slate-400 border-y border-slate-50 group-hover:border-gold-500/20 tracking-tighter lowercase italic">{doc.type}</td>
                        <td className="px-8 py-6 text-[10px] font-bold text-right text-slate-400 border-y border-slate-50 group-hover:border-gold-500/20 italic">{doc.size}</td>
                        <td className="px-8 py-6 text-[10px] font-bold text-right text-slate-300 border-y border-slate-50 group-hover:border-gold-500/20 uppercase tracking-tighter">{doc.uploadDate}</td>
                      </>
                    )}
                    <td className="px-8 py-6 border-y border-slate-50 group-hover:border-gold-500/20 text-center">
                      <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm ${
                        doc.status === 'Verified' ? 'bg-emerald-500 text-white' : 'bg-gold-500 text-white'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 last:rounded-r-[2rem] border-y border-r border-slate-50 group-hover:border-gold-500/20 text-center">
                      <div className="flex justify-center space-x-3">
                        <button className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                          <FaEye size={14} />
                        </button>
                        <button className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:bg-gold-500 hover:text-white transition-all shadow-sm">
                          <FaDownload size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
            <FaFileAlt className="mx-auto text-slate-200 text-7xl mb-6 opacity-50" />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm italic">Vault Empty</p>
            <p className="text-[10px] text-slate-300 mt-2 uppercase tracking-widest">No matching records found in our archive</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
            SECURE ARCHIVE: {filteredDocuments.length} OBJECTS VISIBLE
          </p>
          <div className="flex items-center space-x-3 bg-slate-900 px-6 py-2.5 rounded-full shadow-xl shadow-slate-900/10 border border-slate-800">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Last Integrity Check: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full translate-x-32 translate-y-32"></div>
        <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-10 italic flex items-center">
            <FaShieldAlt className="mr-3 text-lg" />
            Submission Protoctol
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative">
          {[
            { id: 1, text: "Accepted Assets: PDF, JPG, PNG (Max 10MB Load)" },
            { id: 2, text: "High Integrity: Documents must be legible" },
            { id: 3, text: "Process Time: 24-48 Business Hours" },
            { id: 4, text: "End-to-End Military Grade Encryption" }
          ].map(guide => (
            <div key={guide.id} className="flex flex-col space-y-4 group">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 group-hover:border-gold-600 transition-all duration-500">
                <span className="text-xs font-black text-slate-500 group-hover:text-white italic">{guide.id}</span>
              </div>
              <p className="text-xs font-black text-slate-400 leading-relaxed uppercase tracking-wider">{guide.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;