// frontend/src/components/dashboard/UploadModal.jsx
import React from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';

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
    <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gold-500">Upload Document</h3>
          <button
            onClick={onClose}
            className="text-gold-500/70 hover:text-gold-500"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gold-500/70 mb-2">Document Type</label>
            <select className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500">
              <option>Identity Proof (Passport/Driver's License)</option>
              <option>Address Proof (Utility Bill)</option>
              <option>Income Proof (Bank Statement)</option>
              <option>Tax Document</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gold-500/70 mb-2">Upload File</label>
            <div className="border-2 border-dashed border-gold-500/30 rounded-lg p-8 text-center">
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
                <FaUpload className="text-gold-500 text-3xl mb-2" />
                <p className="text-gold-500/70 text-sm mb-1">Click to upload or drag and drop</p>
                <p className="text-gold-500/50 text-xs">PDF, JPG, PNG up to 10MB</p>
              </label>
            </div>
          </div>

          <button className="w-full px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 transition-all">
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;