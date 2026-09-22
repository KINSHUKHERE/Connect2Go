import { supabaseAdmin } from '../config/supabase.js';

async function testListUsers() {
  if (!supabaseAdmin) {
    console.log('No supabaseAdmin');
    return;
  }
  const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
  console.log('--- Auth Users ---');
  if (authUsers?.users) {
    authUsers.users.forEach(u => console.log('Auth user ID:', u.id, 'Email:', u.email, 'Meta:', u.user_metadata));
  } else {
    console.log('Auth error:', authErr);
  }

  const { data: privDetails, error: privErr } = await supabaseAdmin.from('user_private_details').select('*');
  console.log('--- Private Details ---');
  console.log(privDetails, privErr);

  const { data: profiles, error: pErr } = await supabaseAdmin.from('profiles').select('*');
  console.log('--- Profiles ---');
  console.log(profiles, pErr);
}

testListUsers();
