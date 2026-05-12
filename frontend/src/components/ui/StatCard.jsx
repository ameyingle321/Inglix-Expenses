import React from 'react';
import clsx from 'clsx';

export const StatCard = ({ label, value, icon, colorClass, trend }) => {
  return (
    <div className={clsx("p-6 rounded-2xl border shadow-sm", colorClass)}>
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
        {trend && (
          <span className="text-sm font-medium opacity-80">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium opacity-80 mb-1">{label}</h3>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
};
