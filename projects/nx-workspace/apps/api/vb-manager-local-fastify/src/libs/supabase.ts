import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = createClient(
        getEnvironmentVariable('SUPABASE_URL'),
        getEnvironmentVariable('SUPABASE_PUBLISHABLE_KEY'),
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      );
    }
    return (_supabase as never)[prop];
  },
});
