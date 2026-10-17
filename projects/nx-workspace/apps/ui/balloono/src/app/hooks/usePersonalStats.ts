import { useEffect, useState } from 'react';
import { fetchUserStats, UserStats } from '../../lib/stats';
import { useSession } from './useSession';

export function usePersonalStats() {
  const session = useSession();
  const accessToken = session?.access_token;
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setStats(null);
      return;
    }
    let cancelled = false;
    fetchUserStats(accessToken)
      .then(next => !cancelled && setStats(next))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return { signedIn: Boolean(session), stats };
}
