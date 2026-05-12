import { fetchWithAuth } from './apiClient';

export const expenseService = {
  /**
   * Fetch all expenses for the current user
   */
  getExpenses: () => fetchWithAuth('/expenses'),

  /**
   * Create a new expense with optional splits
   * @param {Object} data - { amount, description, category, expense_date, splits: [] }
   */
  createExpense: (data) => fetchWithAuth('/expenses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  /**
   * Update an existing expense
   * @param {string} id - Expense ID
   * @param {Object} data - Updated expense data
   */
  updateExpense: (id, data) => fetchWithAuth(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  /**
   * Delete an expense
   * @param {string} id - Expense ID
   */
  deleteExpense: (id) => fetchWithAuth(`/expenses/${id}`, {
    method: 'DELETE'
  }),

  /**
   * Mark a specific split as settled or unsettled
   * @param {string} splitId - Split ID
   * @param {boolean} is_settled - Settlement status
   */
  settleSplit: (splitId, is_settled) => fetchWithAuth(`/expenses/splits/${splitId}/settle`, {
    method: 'PUT',
    body: JSON.stringify({ is_settled })
  })
};
