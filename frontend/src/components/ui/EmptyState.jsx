import React from 'react';

export const EmptyState = ({ icon, title, description, actionText, onAction }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-brand-dark mb-1">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="text-brand-accent font-medium hover:text-emerald-600 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
