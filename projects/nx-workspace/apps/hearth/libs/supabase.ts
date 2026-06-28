import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabasePublishableKey = process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;
    _supabase = createClient(supabaseUrl, supabasePublishableKey);
  }
  return _supabase;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});
