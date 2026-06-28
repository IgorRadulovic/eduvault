// src/lib/supabase.js
// Supabase client — initialized once, imported wherever data is needed.
// Uses the anon/public key — safe to expose in the browser.
// RLS policies in Supabase control what each user can actually access.

import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = rawSupabaseUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Add them to .env.local to connect to your database.'
  );
}

export const supabase = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseKey  ?? 'placeholder',
  {
    auth: {
      // We handle auth via Firebase — tell Supabase not to manage sessions
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
