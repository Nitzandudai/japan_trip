import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars missing — falling back to localStorage. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: { persistSession: false },
    })
  : null;
