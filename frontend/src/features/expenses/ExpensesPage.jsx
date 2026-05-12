import React, { useEffect, useState } from 'react';
import { expenseService } from '../../services/expenseService';
import { contactService } from '../../services/contactService';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { useToast } from '../../context/ToastContext';
import { Receipt, Plus, Filter, X } from 'lucide-react';
import clsx from 'clsx';

const ExpensesPage = () => {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Expense Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]); // Array of contact IDs to split with

  const fetchData = async () => {
    try {
      const [expensesData, contactsData] = await Promise.all([
        expenseService.getExpenses(),
        contactService.getContacts()
      ]);
      setExpenses(expensesData || []);
      setContacts(contactsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleContact = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    setSubmitting(true);
    
    try {
      const totalAmount = parseFloat(amount);
      let splits = [];
      
      // Basic equal split logic: 
      // If 2 contacts selected, split is three-ways (You + 2 contacts)
      // Total parts = selectedContacts.length + 1
      if (selectedContacts.length > 0) {
        const splitAmount = (totalAmount / (selectedContacts.length + 1)).toFixed(2);
        splits = selectedContacts.map(contactId => ({
          contact_id: contactId,
          owed_amount: splitAmount,
          is_settled: false
        }));
      }

      await expenseService.createExpense({
        amount: totalAmount,
        description,
        category: category || 'Other',
        splits
      });
      
      // Reset and reload
      setAmount('');
      setDescription('');
      setCategory('');
      setSelectedContacts([]);
      setShowAddModal(false);
      toast.success('Expense added successfully!');
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8"><LoadingSkeleton type="full" /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-3">
            <Receipt className="w-7 h-7 text-brand-accent" />
            Expenses
          </h1>
          <p className="text-slate-500 mt-1">All your transaction history and splits.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-full font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
      ) : expenses.length === 0 ? (
        <EmptyState 
          icon={<Receipt className="w-8 h-8" />}
          title="No expenses yet"
          description="Track your spending and split bills with friends."
          actionText="+ Add your first expense"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {expenses.map(expense => (
            <TransactionRow key={expense.id} expense={expense} />
          ))}
        </div>
      )}

      {/* Basic Add Expense Modal (Simplified for now) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-dark">Add New Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <input 
                    type="text" 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    placeholder="Dinner at Luigi's"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                      <option value="">Select...</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {contacts.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">Split with (Equal Split)</label>
                    <div className="flex flex-wrap gap-2">
                      {contacts.map(contact => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => handleToggleContact(contact.id)}
                          className={clsx(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                            selectedContacts.includes(contact.id) 
                              ? "bg-brand-accent border-brand-accent text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          )}
                        >
                          {contact.name}
                        </button>
                      ))}
                    </div>
                    {selectedContacts.length > 0 && amount && (
                      <p className="text-sm text-slate-500 mt-2">
                        Everyone pays: ₹{(parseFloat(amount) / (selectedContacts.length + 1)).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-brand-dark text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
