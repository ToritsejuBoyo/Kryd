const { createClient } = require('@supabase/supabase-js');
const url = 'https://vdzqkxnbehwpfzihyrbb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkenFreG5iZWh3cGZ6aWh5cmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzQyMzQsImV4cCI6MjA5MzgxMDIzNH0.6lAigV6r7aMynVLV96LsbB7_dVrxAUV5m68im1FbfB0';

const supabase = createClient(url, key);

async function run() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  console.log(`Registering user: ${email} with password: ${password}`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) {
    console.error('Error signing up:', error);
  } else {
    console.log('Successfully registered! ID:', data.user ? data.user.id : data);
    console.log(`EMAIL=${email}`);
    console.log(`PASSWORD=${password}`);
  }
}

run();
