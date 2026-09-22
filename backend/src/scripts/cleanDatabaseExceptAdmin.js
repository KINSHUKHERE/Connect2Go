import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function cleanDatabaseExceptAdmin() {
  console.log('===============================================================');
  console.log('🧹 Purging All Test & Seed Data — Retaining ONLY Kinshuk Admin');
  console.log('===============================================================');

  try {
    // 1. Wipe chat messages
    console.log('1. Clearing messages...');
    const { error: msgErr } = await supabase.from('messages').delete().neq('sender_alias', '__NEVER_MATCH__');
    if (msgErr) console.warn('Note on messages delete:', msgErr.message);

    // 2. Wipe conversation participants
    console.log('2. Clearing conversation participants...');
    const { error: cpErr } = await supabase.from('conversation_participants').delete().neq('anonymous_alias', '__NEVER_MATCH__');
    if (cpErr) console.warn('Note on conversation_participants delete:', cpErr.message);

    // 3. Wipe conversations
    console.log('3. Clearing conversations...');
    const { error: convErr } = await supabase.from('conversations').delete().neq('type', '__NEVER_MATCH__');
    if (convErr) console.warn('Note on conversations delete:', convErr.message);

    // 4. Wipe activity participants
    console.log('4. Clearing activity participants...');
    const { error: apErr } = await supabase.from('activity_participants').delete().neq('status', '__NEVER_MATCH__');
    if (apErr) console.warn('Note on activity_participants delete:', apErr.message);

    // 5. Wipe activities
    console.log('5. Clearing all activities...');
    const { error: actErr } = await supabase.from('activities').delete().neq('title', '__NEVER_MATCH__');
    if (actErr) console.warn('Note on activities delete:', actErr.message);

    // 6. Wipe reports
    console.log('6. Clearing all safety reports...');
    const { error: repErr } = await supabase.from('reports').delete().neq('reason', '__NEVER_MATCH__');
    if (repErr) console.warn('Note on reports delete:', repErr.message);

    // 7. Manage Auth Users & Profiles
    console.log('7. Synchronizing Auth users (Retaining only herekinshuk@gmail.com with password 123456)...');
    const { data: userListData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
      console.error('Error listing auth users:', listErr.message);
    }

    const allUsers = userListData?.users || [];
    let adminAuthId = null;

    for (const usr of allUsers) {
      const email = (usr.email || '').toLowerCase();
      if (email === 'herekinshuk@gmail.com') {
        adminAuthId = usr.id;
        console.log(`Found admin user: ${usr.email} (${usr.id}). Updating password to 123456...`);
        const { error: updateErr } = await supabase.auth.admin.updateUserById(usr.id, {
          password: '123456',
          user_metadata: {
            name: 'Kinshuk Khandelwal',
            username: 'kinshuk_admin',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
          }
        });
        if (updateErr) console.error('Failed to update admin password:', updateErr.message);
        else console.log('✅ Admin password successfully set to 123456');
      } else {
        console.log(`Deleting non-admin user: ${usr.email} (${usr.id})...`);
        await supabase.from('profiles').delete().eq('id', usr.id);
        const { error: delErr } = await supabase.auth.admin.deleteUser(usr.id);
        if (delErr) console.warn(`Could not delete user ${usr.email}:`, delErr.message);
        else console.log(`Deleted user ${usr.email}`);
      }
    }

    // If admin didn't exist in auth, create now
    if (!adminAuthId) {
      console.log('Admin account not found in Auth. Creating herekinshuk@gmail.com with password 123456...');
      const { data: created, error: cErr } = await supabase.auth.admin.createUser({
        email: 'herekinshuk@gmail.com',
        password: '123456',
        email_confirm: true,
        user_metadata: {
          name: 'Kinshuk Khandelwal',
          username: 'kinshuk_admin',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
        }
      });
      if (cErr) {
        console.error('Failed to create admin auth user:', cErr.message);
      } else {
        adminAuthId = created.user.id;
        console.log(`✅ Created Admin User: herekinshuk@gmail.com (${adminAuthId})`);
      }
    }

    // 8. Delete any other profiles in public.profiles that do not belong to admin
    if (adminAuthId) {
      await supabase.from('profiles').delete().neq('id', adminAuthId);

      // Upsert fresh admin profile
      const pointWkt = `SRID=4326;POINT(75.8753 26.7725)`;
      const { error: pErr } = await supabase
        .from('profiles')
        .upsert({
          id: adminAuthId,
          name: 'Kinshuk Khandelwal',
          username: 'kinshuk_admin',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          bio: 'Platform Administrator & Creator of Connect2Go.',
          interests: ['Community', 'Sports', 'Tech'],
          location_label: 'Campus Hub, Jaipur',
          location: pointWkt,
          role: 'admin',
          reliability_score: 100.0,
          stats: { activities: 0, matches: 0, connections: 0 },
          updated_at: new Date().toISOString()
        });

      if (pErr) console.error('Failed to upsert admin profile:', pErr.message);
      else console.log('✅ Admin Profile upserted with clean 0 stats!');
    }

    // 9. Verify current counts
    const { count: actCount } = await supabase.from('activities').select('*', { count: 'exact', head: true });
    const { count: repCount } = await supabase.from('reports').select('*', { count: 'exact', head: true });
    const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    console.log('\n================ Verification ================');
    console.log(`Activities in DB: ${actCount || 0}`);
    console.log(`Reports in DB:    ${repCount || 0}`);
    console.log(`Profiles in DB:   ${profCount || 0} (Should be 1: Kinshuk Khandelwal)`);
    console.log('==============================================\n');

  } catch (err) {
    console.error('Fatal cleanup error:', err);
  }
}

cleanDatabaseExceptAdmin();
