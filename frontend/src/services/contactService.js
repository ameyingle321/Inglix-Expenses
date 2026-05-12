import { fetchWithAuth } from './apiClient';

export const contactService = {
  /**
   * Fetch all contacts for the current user
   */
  getContacts: () => fetchWithAuth('/contacts'),

  /**
   * Add a new contact
   * @param {Object} data - { name, email }
   */
  createContact: (data) => fetchWithAuth('/contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  /**
   * Delete a contact
   * @param {string} id - Contact ID
   */
  deleteContact: (id) => fetchWithAuth(`/contacts/${id}`, {
    method: 'DELETE'
  })
};
