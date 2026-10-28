'use client';

import { useCallback, useState } from 'react';
import { authFetch } from '../../../libs/auth';
import { usePollingInterval } from './usePollingInterval';

interface PolledResourceOptions<T> {
  endpoint: string;
  intervalMs: number;
  errorMessage: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select?: (json: any) => T;
}

export const usePolledResource = <T>({
  endpoint,
  intervalMs,
  errorMessage,
  select = json => json as T,
}: PolledResourceOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const response = await authFetch(endpoint);
      if (!response.ok) throw new Error(errorMessage);
      setData(select(await response.json()));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : errorMessage);
      console.error(errorMessage, err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, errorMessage]);

  usePollingInterval(refetch, intervalMs);

  return { data, loading, error, refetch };
};
