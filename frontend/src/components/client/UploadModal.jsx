import React from 'react';
import { FaTimes, FaCloudUploadAlt, FaFileAlt, FaShieldAlt } from 'react-icons/fa';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 sm:p-8">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-12 w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_120px_rgba(0,0,0,0.15)] relative ring-1 ring-slate-100 dark:ring-slate-800 group">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 blur-[80px] rounded-full group-hover:bg-gold-500/20 transition-all duration-700"></div>

        <div className="flex items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10 relative z-10">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase transition-colors">Vault Ingestion</h3>
            <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-[0.3em] flex items-center">
              <FaShieldAlt className="mr-2 text-gold-500" /> Secure Protocol Transmission
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-[1.5rem] flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700 hover:shadow-xl group/close"
          >
            <FaTimes size={20} className="group-hover/close:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        <div className="space-y-10 relative z-10">
          {/* Document Type Selection */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Artifact Classification</label>
            <div className="relative group/select">
              <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] text-xs font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 transition-all appearance-none">
                <option>Identity Proof (Passport/License)</option>
                <option>Residency Verification (Utility)</option>
                <option>Financial Statement (Flow)</option>
                <option>Fiscal Protocol (Taxes)</option>
                <option>Other Encrypted Artifacts</option>
              </select>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gold-500 group-focus-within/select:scale-125 transition-transform">
                 <FaFileAlt size={14} />
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Payload Transfer</label>
            <div className="border-4 border-dashed border-slate-50 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 text-center group/upload hover:bg-slate-50/50 dark:hover:bg-slate-800/20 hover:border-gold-500/20 transition-all duration-500 bg-slate-50/30 dark:bg-slate-800/10">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl flex items-center justify-center mb-6 group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                  <FaCloudUploadAlt className="text-gold-500 text-3xl group-hover/upload:animate-bounce" />
                </div>
                <p className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest mb-2 italic transition-colors">Deploy File Stream</p>
                <p className="text-slate-400 text-[9px] uppercase font-black tracking-widest opacity-60">PDF, JPG, PNG | MAGNITUDE 10MB MAX</p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
            <button className="flex-1 px-8 sm:px-10 py-5 sm:py-6 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.24em] sm:tracking-[0.3em] text-[10px] sm:text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all duration-500 shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1">
              Finalize Transmission
            </button>
            <button
              onClick={onClose}
              className="px-8 sm:px-10 py-5 sm:py-6 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] font-black uppercase tracking-[0.24em] sm:tracking-[0.3em] text-[10px] sm:text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
            >
              Discard
            </button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic flex items-center justify-center">
              <FaShieldAlt className="mr-2 text-emerald-400" /> End-to-end Vault Encryption Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
