import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-rose-50 border-rose-100',
    info: 'bg-blue-50 border-blue-100'
  };

  return (
    <div className={clsx(
      "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-fade-in-up min-w-[300px]",
      bgColors[type] || bgColors.info
    )}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium text-slate-800">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
