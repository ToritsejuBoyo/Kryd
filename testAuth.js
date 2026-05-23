// testAuth.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const url = env.EXPO_PUBLIC_SUPABASE_URL || '';
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function testSignIn() {
  console.log('Attempting sign in for gfrfrfim@gmail.com...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'gfrfrfim@gmail.com',
    password: 'password123' // Let's try a default password
  });

  if (error) {
    console.error('Sign in failed:', error.message);
    // Let's try signing up if it doesn't exist
    console.log('Attempting sign up...');
    const { data: sData, error: sError } = await supabase.auth.signUp({
      email: 'gfrfrfim@gmail.com',
      password: 'password123'
    });
    if (sError) {
      console.error('Sign up failed:', sError.message);
    } else {
      console.log('Sign up successful!', sData);
    }
  } else {
    console.log('Sign in successful!', data);
  }
}

testSignIn();
