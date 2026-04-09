import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  process.stderr.write('Warning: SUPABASE_URL or SUPABASE_ANON_KEY is missing from environment variables.\n');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
