// testSupabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  const { data, error } = await supabase.from('courses').select('*');
  
  if (error) {
    console.error('Error fetching courses:', error);
  } else {
    console.log('Successfully fetched courses:');
    console.log(data);
  }
}

testConnection();
