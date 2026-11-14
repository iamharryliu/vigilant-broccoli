import { createClient } from '@supabase/supabase-js';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
} from '@vigilant-broccoli/common-js';
import { getSupabasePublishableKey, getSupabaseUrl } from './runtime-config';

// Stateless verifier: it must not own a stored session (see the Supabase auth
// pattern's single-session-owner rule).
const supabase = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export const getUserEmail = async (
  request: Request,
): Promise<string | null> => {
  const auth = request.headers.get(AUTHORIZATION_HEADER);
  if (!auth?.startsWith(BEARER_PREFIX)) return null;

  const { data, error } = await supabase.auth.getUser(
    auth.slice(BEARER_PREFIX.length),
  );
  if (error || !data.user?.email) return null;
  return data.user.email;
};
