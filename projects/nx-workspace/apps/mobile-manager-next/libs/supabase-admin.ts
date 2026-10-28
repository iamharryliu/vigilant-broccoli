import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { getSupabaseUrl } from '@vigilant-broccoli/infrastructure';

let _supabaseAdmin: SupabaseClient | null = null;

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(
        getSupabaseUrl(),
        getEnvironmentVariable('SUPABASE_SECRET_KEY'),
        { auth: { persistSession: false } },
      );
    }
    return (_supabaseAdmin as never)[prop];
  },
});
