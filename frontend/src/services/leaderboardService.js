import { supabase } from '../lib/supabaseClient';

/**
 * Gets the current authenticated user's ID, or throws.
 */
async function requireUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('You must be logged in to perform this action.');
  return user.id;
}

export const leaderboardService = {
  /**
   * Get leaderboard statistics for the user's contacts.
   * Aggregates owed amounts from expense_splits across all the user's expenses.
   */
  getLeaderboard: async () => {
    const userId = await requireUserId();

    // Fetch all expenses belonging to this user, with splits + contact info
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        id,
        expense_splits (
          owed_amount,
          is_settled,
          contact_id,
          contacts ( id, name, email )
        )
      `)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    // Aggregate by contact
    const contactMap = {};

    for (const expense of (expenses || [])) {
      for (const split of (expense.expense_splits || [])) {
        const contact = split.contacts;
        if (!contact) continue;

        if (!contactMap[contact.id]) {
          contactMap[contact.id] = {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            avatar_url: null,
            total_owed_to_user: 0,
            total_pending: 0,
          };
        }

        const amount = parseFloat(split.owed_amount || 0);
        contactMap[contact.id].total_owed_to_user += amount;

        if (!split.is_settled) {
          contactMap[contact.id].total_pending += amount;
        }
      }
    }

    // Sort by total pending (descending)
    return Object.values(contactMap)
      .sort((a, b) => b.total_pending - a.total_pending);
  }
};
