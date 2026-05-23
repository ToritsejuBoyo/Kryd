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

const columns = [
  'id', 'user_id', 'full_name', 'role', 'points', 'coins',
  'default_mode', 'availability', 'profile_complete',
  'community_groups', 'country', 'avatar_url', 'created_at'
];

async function check() {
  console.log('Testing column existence...');
  for (const col of columns) {
    const testId = '00000000-0000-0000-0000-000000000000';
    const payload = {
      id: testId,
      user_id: testId,
    };
    if (col !== 'id' && col !== 'user_id') {
      payload[col] = col === 'points' || col === 'coins' || col === 'profile_complete' ? 0 
                     : col === 'community_groups' ? [] : 'test';
    }
    
    const { error } = await supabase.from('profiles').insert(payload);
    if (error && error.code === 'PGRST204') {
      console.log(`Column [${col}]: DOES NOT EXIST`);
    } else if (error && error.code === '42501') {
      console.log(`Column [${col}]: EXISTS (RLS error)`);
    } else {
      console.log(`Column [${col}]: result is`, error || 'SUCCESS');
    }
  }
}
check();
