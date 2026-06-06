import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
      );
    }
    return (_supabase as never)[prop];
  },
});
