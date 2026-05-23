const { createClient } = require('@supabase/supabase-js');

const url = 'https://vdzqkxnbehwpfzihyrbb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkenFreG5iZWh3cGZ6aWh5cmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzQyMzQsImV4cCI6MjA5MzgxMDIzNH0.6lAigV6r7aMynVLV96LsbB7_dVrxAUV5m68im1FbfB0';

const supabase = createClient(url, key);

async function test() {
  console.log('Fetching...');
  try {
    const { data, error } = await supabase.from('courses').select('*');
    console.log('Data:', data ? data.length : null);
    console.log('Error:', error);
  } catch (e) {
    console.log('Exception:', e);
  }
}
test();
