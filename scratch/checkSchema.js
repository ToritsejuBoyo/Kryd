const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*EXPO_PUBLIC_(\w+)\s*=\s*(.+)$/);
  if (match) {
    env[`EXPO_PUBLIC_${match[1]}`] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const url = env.EXPO_PUBLIC_SUPABASE_URL || '';
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profile columns:', data[0] ? Object.keys(data[0]) : 'No profiles in DB');
    console.log('Sample profile:', data[0]);
  }
}
check();
