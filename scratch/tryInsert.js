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
  const testId = '00000000-0000-0000-0000-000000000000';
  const dummyProfile = {
    id: testId,
    user_id: testId,
    full_name: 'Test Dummy',
    role: 'IT Support Specialist',
    points: 0,
    coins: 0,
    default_mode: 'freelancer',
    availability: 'available',
    profile_complete: 25,
    community_groups: ['Hiring & Projects'],
    country: 'Nigeria'
  };
  
  console.log('Inserting dummy profile with all columns:', dummyProfile);
  const { data, error } = await supabase
    .from('profiles')
    .insert(dummyProfile)
    .select();
    
  if (error) {
    console.error('Error inserting profile:', error);
  } else {
    console.log('Successfully inserted profile:', data);
  }
}
check();
