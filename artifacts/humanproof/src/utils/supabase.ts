// BUG-C5 FIX: Was throwing on missing env vars, crashing the entire app.
// Now degrades gracefully — auth features disabled but app loads.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[HumanProof] Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
    'Auth features will be disabled. Set these in .env to enable login.'
  );
}

// Export null-safe client — AuthContext handles null gracefully
export const supabase: SupabaseClient = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : (createClient('https://placeholder.supabase.co', 'placeholder') as SupabaseClient);
