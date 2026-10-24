import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseUrl,
  SUPABASE_PUBLISHABLE_KEY,
} from '@vigilant-broccoli/infrastructure';

let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = createClient(
        getSupabaseUrl(),
        process.env['SUPABASE_PUBLISHABLE_KEY'] || SUPABASE_PUBLISHABLE_KEY,
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
