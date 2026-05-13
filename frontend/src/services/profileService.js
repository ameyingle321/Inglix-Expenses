import { supabase } from '../lib/supabaseClient';

/**
 * Gets the current authenticated user's ID, or throws.
 */
async function requireUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('You must be logged in to perform this action.');
  return user.id;
}

export const profileService = {
  /**
   * Get the current user's profile.
   */
  getProfile: async () => {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Update the current user's profile.
   * @param {Object} data - { display_name, avatar_url }
   */
  updateProfile: async ({ display_name, avatar_url }) => {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name, avatar_url, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};
