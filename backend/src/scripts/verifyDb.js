import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Testing Supabase Connection ---');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key configured:', Boolean(supabaseServiceKey));

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkConnection() {
  try {
    // 1. Check connection by querying public.profiles or system information
    console.log('\n1. Querying public.profiles table...');
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profileErr) {
      console.log('ℹ️ profiles query response:', profileErr.message);
      if (profileErr.code === '42P01') {
        console.log('⚠️ Table "profiles" does not exist yet. Please execute schema.sql in Supabase SQL Editor.');
      }
    } else {
      console.log(`✅ profiles table exists! Found ${profiles.length} records.`);
    }

    // 2. Check activities table
    console.log('\n2. Querying public.activities table...');
    const { data: activities, error: actErr } = await supabase
      .from('activities')
      .select('*')
      .limit(5);

    if (actErr) {
      console.log('ℹ️ activities query response:', actErr.message);
    } else {
      console.log(`✅ activities table exists! Found ${activities.length} records.`);
    }

    // 3. Test Cloudinary Configuration
    console.log('\n3. Testing Cloudinary Configuration...');
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudKey = process.env.CLOUDINARY_API_KEY;
    console.log(`✅ Cloudinary Cloud: ${cloudName} | Key: ${cloudKey ? 'Configured' : 'Missing'}`);

  } catch (err) {
    console.error('❌ Unexpected error during connection check:', err);
  }
}

checkConnection();
