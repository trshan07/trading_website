// frontend/src/components/common/Modal.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gold-500">{title}</h3>
          <button
            onClick={onClose}
            className="text-gold-500/70 hover:text-gold-500"
          >
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;