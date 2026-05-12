import { fetchWithAuth } from './apiClient';

export const profileService = {
  /**
   * Get the current user's profile
   */
  getProfile: () => fetchWithAuth('/profile'),

  /**
   * Update the current user's profile
   * @param {Object} data - { display_name, avatar_url }
   */
  updateProfile: (data) => fetchWithAuth('/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};
