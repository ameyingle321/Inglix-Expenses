import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

/**
 * A wrapper around native fetch that automatically attaches the Supabase JWT token.
 * 
 * @param {string} endpoint - The API endpoint to call (e.g., '/expenses')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function fetchWithAuth(endpoint, options = {}) {
  // 1. Get the current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('You must be logged in to perform this action.');
  }

  // 2. Set up headers, attaching the token
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${session.access_token}`);
  headers.set('Content-Type', 'application/json');

  // 3. Make the API call
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Handle response
  if (!response.ok) {
    let errorMessage = 'An API error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Ignore JSON parse errors if response is plain text or empty
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
