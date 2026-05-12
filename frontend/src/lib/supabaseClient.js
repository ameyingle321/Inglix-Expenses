import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging: Verify env variables are loaded (hide actual key for security)
console.log('Supabase Config Loaded:', { 
  hasUrl: !!supabaseUrl, 
  hasAnonKey: !!supabaseAnonKey 
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Check your .env file.');
}

// Strictly use Anon Key for Frontend
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
