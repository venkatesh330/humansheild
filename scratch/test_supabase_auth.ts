import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key ends with:', supabaseAnonKey?.slice(-10));

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    // Attempt a simple query or health check
    const { data, error } = await supabase.from('safe_careers').select('id').limit(1);
    if (error) {
      console.error('Connection failed:', error.message);
      if (error.message.includes('JWT')) {
        console.error('This is likely a JWT/API Key issue.');
      }
    } else {
      console.log('Connection success! Found', data.length, 'rows in safe_careers.');
    }
  } catch (err: any) {
    console.error('Unexpected error:', err.message);
  }
}

testAuth();
