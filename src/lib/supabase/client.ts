import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('https://')
  );
};

/**
 * Public client for client-side or anonymous server queries.
 */
export const createClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};

/**
 * Server-only administrative client using the Service Role Key.
 * Bypasses RLS to manage orders, inventory, and payments from verified server API routes.
 */
export const createAdminClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // Use service role key if available, otherwise fall back to anon key
  const keyToUse = supabaseServiceRoleKey && !supabaseServiceRoleKey.includes('placeholder')
    ? supabaseServiceRoleKey
    : supabaseAnonKey;

  return createSupabaseClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
