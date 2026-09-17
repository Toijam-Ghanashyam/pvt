import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

/**
 * Toast — Lightweight self-built toast notification.
 * No external library needed.
 *
 * Props:
 *  - message: string to display
 *  - type: 'success' | 'error'
 *  - onClose: callback to dismiss
 *  - duration: auto-dismiss in ms (default 4000)
 */
const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[9999] animate-toast-in">
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl border max-w-full sm:max-w-sm mx-auto transition-colors ${
          isSuccess
            ? 'bg-emerald-50 dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-slate-900 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}
      >
        {isSuccess ? (
          <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle size={18} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
