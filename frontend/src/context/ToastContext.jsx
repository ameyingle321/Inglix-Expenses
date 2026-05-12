import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/ui/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration)
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Render all active toasts stacked vertically */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast 
              message={t.message} 
              type={t.type} 
              duration={t.duration} 
              onClose={() => removeToast(t.id)} 
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
