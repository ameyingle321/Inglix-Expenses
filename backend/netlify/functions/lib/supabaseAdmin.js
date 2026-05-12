require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

module.exports = { supabaseAdmin };
