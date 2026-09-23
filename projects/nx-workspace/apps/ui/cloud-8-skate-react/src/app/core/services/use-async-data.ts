import { useEffect, useState } from 'react';

export const useAsyncData = <T>(load: () => Promise<T>, key = '') => {
  const [state, setState] = useState<{ data: T | null; isLoading: boolean }>({
    data: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, isLoading: true });
    load().then(data => {
      if (!cancelled) setState({ data, isLoading: false });
    });
    return () => {
      cancelled = true;
    };
    // `load` is recreated every render; `key` identifies what it fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
};
