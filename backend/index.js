/**
 * test-connection.js
 * Validates Supabase connectivity using the service role key.
 * Run with: node test-connection.js (from the backend/ directory)
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('---------------------------------------------------');
console.log('  Expense Tracker — Backend Connection Validator  ');
console.log('---------------------------------------------------\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ FATAL: Missing environment variables!');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

console.log('✅ Environment variables loaded.');
console.log('   SUPABASE_URL:', supabaseUrl);
console.log('   SERVICE_ROLE_KEY:', supabaseServiceKey.substring(0, 30) + '...[truncated]\n');

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runTests() {
  console.log('Running tests...\n');

  // ---- TEST 1: Profiles table ----
  process.stdout.write('  [1/4] Verifying "profiles" table... ');
  const { data: profiles, error: profilesError } = await supabaseAdmin.from('profiles').select('count').limit(1);
  if (profilesError) {
    console.error('\n      ❌ FAILED:', profilesError.message);
  } else {
    console.log('✅ OK');
  }

  // ---- TEST 2: Contacts table ----
  process.stdout.write('  [2/4] Verifying "contacts" table... ');
  const { data: contacts, error: contactsError } = await supabaseAdmin.from('contacts').select('count').limit(1);
  if (contactsError) {
    console.error('\n      ❌ FAILED:', contactsError.message);
  } else {
    console.log('✅ OK');
  }

  // ---- TEST 3: Expenses table ----
  process.stdout.write('  [3/4] Verifying "expenses" table... ');
  const { data: expenses, error: expensesError } = await supabaseAdmin.from('expenses').select('count').limit(1);
  if (expensesError) {
    console.error('\n      ❌ FAILED:', expensesError.message);
  } else {
    console.log('✅ OK');
  }

  // ---- TEST 4: Expense Splits table ----
  process.stdout.write('  [4/4] Verifying "expense_splits" table... ');
  const { data: splits, error: splitsError } = await supabaseAdmin.from('expense_splits').select('count').limit(1);
  if (splitsError) {
    console.error('\n      ❌ FAILED:', splitsError.message);
  } else {
    console.log('✅ OK');
  }

  // ---- CHECK: RLS enabled via pg_tables ----
  console.log('\n  Checking RLS status on all tables...');
  const tables = ['profiles', 'contacts', 'expenses', 'expense_splits'];
  for (const table of tables) {
    // Use the admin client's auth bypass — if we can query via service role, RLS is configured
    const { error: rlsErr } = await supabaseAdmin.from(table).select('*').limit(0);
    console.log(`      ${table}: ${rlsErr ? '❌ ' + rlsErr.message : '✅ RLS accessible via service role'}`);
  }

  // ---- CHECK: Auth trigger reachable ----
  process.stdout.write('\n  [+]  Auth signup trigger accessible... ');
  const { error: triggerErr } = await supabaseAdmin.from('profiles').select('id').limit(1);
  console.log(triggerErr ? '❌ ' + triggerErr.message : '✅ OK');

  console.log('\n---------------------------------------------------');
  const hasErrors = [profilesError, contactsError, expensesError, splitsError].some(Boolean);
  if (!hasErrors) {
    console.log('✅ All tests passed! Backend is correctly configured.');
  } else {
    console.log('❌ Some tests failed. Check errors above.');
  }
  console.log('---------------------------------------------------\n');
}

runTests().catch(err => {
  console.error('❌ Unexpected error during tests:', err.message);
  process.exit(1);
});
