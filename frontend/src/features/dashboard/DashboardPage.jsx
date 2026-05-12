import React, { useEffect, useState } from 'react';
import { expenseService } from '../../services/expenseService';
import { profileService } from '../../services/profileService';
import { StatCard } from '../../components/ui/StatCard';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesData, profileData] = await Promise.all([
          expenseService.getExpenses(),
          profileService.getProfile()
        ]);
        setExpenses(expensesData || []);
        setProfile(profileData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8"><LoadingSkeleton type="full" /></div>;

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">Error: {error}</div>;
  }

  // Calculate totals
  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  
  // Basic calculation for splits (assuming current user is the creator for now)
  let owedToYou = 0;
  expenses.forEach(exp => {
    if (exp.expense_splits) {
      exp.expense_splits.forEach(split => {
        if (!split.is_settled) {
          owedToYou += parseFloat(split.owed_amount || 0);
        }
      });
    }
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">
            Hello, {profile?.display_name || 'User'} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's your financial overview.</p>
        </div>
        <button 
          onClick={() => navigate('/expenses')}
          className="flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          label="Total Spent" 
          value={`₹${totalSpent.toFixed(2)}`} 
          icon={<Wallet className="w-6 h-6" />} 
          colorClass="bg-white border-slate-200 text-brand-dark" 
        />
        <StatCard 
          label="Owed to you" 
          value={`₹${owedToYou.toFixed(2)}`} 
          icon={<ArrowDownLeft className="w-6 h-6" />} 
          colorClass="bg-emerald-500 border-emerald-600 text-white" 
          trend="Pending"
        />
        <StatCard 
          label="You owe" 
          value="₹0.00" 
          icon={<ArrowUpRight className="w-6 h-6" />} 
          colorClass="bg-rose-500 border-rose-600 text-white" 
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <h2 className="text-lg font-semibold text-brand-dark">Recent Activity</h2>
           <button onClick={() => navigate('/expenses')} className="text-sm font-medium text-brand-accent hover:text-emerald-600">View All</button>
         </div>
         
         <div>
           {expenses.length === 0 ? (
             <EmptyState 
               icon={<Receipt className="w-8 h-8" />}
               title="No expenses yet"
               description="Add an expense to start tracking your splits."
               actionText="+ Add your first expense"
               onAction={() => navigate('/expenses')}
             />
           ) : (
             expenses.slice(0, 5).map(expense => (
               <TransactionRow key={expense.id} expense={expense} />
             ))
           )}
         </div>
      </div>
    </div>
  );
};

export default DashboardPage;
