const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Look for .env in the parent directory (backend/)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.SUPABASE_URL) {
  console.error('SUPABASE_URL is not defined in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  const email = 'tester_antigravity@example.com';
  const password = 'Password123!';

  console.log(`Creating user: ${email}`);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  console.log('User created successfully:', data.user.id);
}

createTestUser();
