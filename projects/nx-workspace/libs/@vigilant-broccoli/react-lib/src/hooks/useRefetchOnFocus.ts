import { useEffect, useRef } from 'react';

// visibilitychange and focus often fire together; collapse them into one fetch.
const FOCUS_REFETCH_MIN_INTERVAL_MS = 5000;

/**
 * Picks up changes made on another device when the tab regains attention.
 * Pass `busy` while an optimistic update or edit is pending so a refetch can't
 * overwrite local state that hasn't reached the server yet.
 */
export const useRefetchOnFocus = (
  refetch: () => unknown,
  { enabled = true, busy = false }: { enabled?: boolean; busy?: boolean } = {},
) => {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const lastRefetchRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const refetchIfStale = () => {
      if (document.visibilityState !== 'visible' || busyRef.current) return;
      const now = Date.now();
      if (now - lastRefetchRef.current < FOCUS_REFETCH_MIN_INTERVAL_MS) return;
      lastRefetchRef.current = now;
      refetchRef.current();
    };
    document.addEventListener('visibilitychange', refetchIfStale);
    window.addEventListener('focus', refetchIfStale);
    return () => {
      document.removeEventListener('visibilitychange', refetchIfStale);
      window.removeEventListener('focus', refetchIfStale);
    };
  }, [enabled]);
};
