import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
        // Realtime/stateless client only — the react-lib auth client owns the
        // stored session. Two clients sharing one storage key means two
        // auto-refresh tickers racing on a rotating refresh token.
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
