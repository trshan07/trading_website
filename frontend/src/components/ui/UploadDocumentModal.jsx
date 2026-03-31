import React, { useState } from 'react';
import { FaUpload, FaTimes, FaShieldAlt, FaFileAlt } from 'react-icons/fa';

const UploadDocumentModal = ({ show, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Identity Proof');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    
    onUpload({
      name: file.name,
      category,
      type: file.type.split('/')[1].toUpperCase(),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });
    
    setFile(null);
    onClose();
  };

  const categories = ['Identity Proof', 'Address Proof', 'Income Proof', 'Bank Statement', 'Tax Document'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800 transition-colors">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight transition-colors">Vault Submission</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-all">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block px-2">Document Category</label>
            <div className="grid grid-cols-1 gap-2">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-black italic focus:outline-none transition-all appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block px-2">File Payload</label>
            <div className="relative group">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              <div className="w-full flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] group-hover:border-gold-500 transition-all">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  <FaUpload className="text-gold-500 text-xl" />
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic transition-colors">
                  {file ? file.name : "Select Document"}
                </p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">PDF, JPG, PNG (Max 10MB)</p>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/20 flex items-center justify-center space-x-3 group"
            disabled={!file}
          >
            <FaShieldAlt size={12} className="group-hover:rotate-12 transition-transform" />
            <span>Secure Submission</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
