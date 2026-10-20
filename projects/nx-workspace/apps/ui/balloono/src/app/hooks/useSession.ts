import type { Session } from '@supabase/supabase-js';
import { useAuth } from '../../lib/auth';
import { ONLINE_AVAILABLE } from '../app.consts';

// `AuthProvider` is only mounted when Supabase is configured; without it the
// app behaves as a permanent guest instead of throwing.
const useGuestSession = (): Session | null => null;

export const useSession = ONLINE_AVAILABLE ? useAuth : useGuestSession;

export const displayNameOf = (session: Session | null) => {
  const metadata = session?.user.user_metadata ?? {};
  return String(metadata.full_name ?? metadata.name ?? '').trim();
};
