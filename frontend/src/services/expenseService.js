import { supabase } from '../lib/supabaseClient';

/**
 * Gets the current authenticated user's ID, or throws.
 */
async function requireUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('You must be logged in to perform this action.');
  return user.id;
}

export const expenseService = {
  /**
   * Fetch all expenses for the current user, including nested splits + contacts.
   */
  getExpenses: async () => {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_splits (
          id,
          contact_id,
          owed_amount,
          is_settled,
          contacts ( id, name, email )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Create a new expense with optional splits.
   * @param {Object} data - { amount, description, category, expense_date, splits: [] }
   */
  createExpense: async ({ amount, description, category, expense_date, splits }) => {
    const userId = await requireUserId();

    // 1. Insert the expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        amount,
        description,
        category: category || 'Other',
        expense_date: expense_date || new Date().toISOString(),
      })
      .select()
      .single();

    if (expenseError) throw new Error(expenseError.message);

    // 2. Insert splits if provided
    if (splits && splits.length > 0) {
      const splitRows = splits.map((s) => ({
        expense_id: expense.id,
        contact_id: s.contact_id,
        owed_amount: s.owed_amount,
        is_settled: s.is_settled ?? false,
      }));

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splitRows);

      if (splitsError) throw new Error(splitsError.message);
    }

    return expense;
  },

  /**
   * Update an existing expense.
   * @param {string} id - Expense ID
   * @param {Object} data - Updated expense fields
   */
  updateExpense: async (id, { amount, description, category, expense_date }) => {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('expenses')
      .update({ amount, description, category, expense_date })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Delete an expense (DB cascade handles splits).
   * @param {string} id - Expense ID
   */
  deleteExpense: async (id) => {
    const userId = await requireUserId();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return null;
  },

  /**
   * Mark a specific split as settled or unsettled.
   * @param {string} splitId - Split ID
   * @param {boolean} is_settled - Settlement status
   */
  settleSplit: async (splitId, is_settled) => {
    const { data, error } = await supabase
      .from('expense_splits')
      .update({ is_settled })
      .eq('id', splitId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};
