import { supabase } from '../lib/supabaseClient';

/**
 * Gets the current authenticated user's ID, or throws.
 */
async function requireUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('You must be logged in to perform this action.');
  return user.id;
}

export const contactService = {
  /**
   * Fetch all contacts for the current user.
   */
  getContacts: async () => {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Add a new contact.
   * @param {Object} data - { name, email }
   */
  createContact: async ({ name, email }) => {
    const userId = await requireUserId();

    if (!name) throw new Error('name is required.');

    const { data, error } = await supabase
      .from('contacts')
      .insert({ user_id: userId, name, email })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Delete a contact.
   * @param {string} id - Contact ID
   */
  deleteContact: async (id) => {
    const userId = await requireUserId();

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return null;
  }
};
