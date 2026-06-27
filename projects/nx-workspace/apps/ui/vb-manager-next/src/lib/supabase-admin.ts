import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

let _supabaseAdmin: SupabaseClient | null = null;

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(
        getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_URL'),
        getEnvironmentVariable('SUPABASE_SECRET_KEY'),
        { auth: { persistSession: false } },
      );
    }
    return (_supabaseAdmin as never)[prop];
  },
});
