import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

/**
 * Single shared Supabase client for the browser.
 * Uses the anon key — all privileged logic lives behind Edge Functions
 * and Row Level Security, never in the client.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
