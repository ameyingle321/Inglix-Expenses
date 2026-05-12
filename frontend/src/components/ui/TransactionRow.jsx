import React from 'react';
import { Receipt, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

export const TransactionRow = ({ expense }) => {
  const isOwed = false; // We will calculate this based on splits and current user later
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-brand-dark">{expense.description}</p>
          <p className="text-sm text-slate-500">
            {new Date(expense.expense_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
             {' • '} {expense.category || 'Uncategorized'}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-brand-dark">₹{parseFloat(expense.amount).toFixed(2)}</p>
        {expense.expense_splits && expense.expense_splits.length > 0 && (
          <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mt-1">
            <Users className="w-3 h-3" />
            <span>{expense.expense_splits.length} split(s)</span>
          </div>
        )}
      </div>
    </div>
  );
};
