import React from 'react';
import clsx from 'clsx';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-lg mb-4"></div>
            <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
            <div className="w-32 h-8 bg-slate-200 rounded"></div>
          </div>
        );
      case 'row':
        return (
          <div className="flex items-center justify-between p-4 border-b border-slate-100 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              <div>
                <div className="w-40 h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-24 h-3 bg-slate-200 rounded"></div>
              </div>
            </div>
            <div className="w-16 h-5 bg-slate-200 rounded"></div>
          </div>
        );
      case 'full':
      default:
        return (
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="w-48 h-8 bg-slate-200 rounded mb-2"></div>
                <div className="w-64 h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="w-32 h-10 bg-slate-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="h-32 bg-slate-200 rounded-2xl"></div>
               <div className="h-32 bg-slate-200 rounded-2xl"></div>
               <div className="h-32 bg-slate-200 rounded-2xl"></div>
            </div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};
