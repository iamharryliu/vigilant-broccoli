interface CachedEntry<T> {
  value: T;
  timestamp: number;
}

export function createTtlCache<T>(ttlMs: number, fetcher: () => Promise<T>) {
  let cached: CachedEntry<T> | null = null;

  return async (force = false): Promise<T> => {
    const now = Date.now();
    if (!force && cached && now - cached.timestamp < ttlMs) {
      return cached.value;
    }

    const value = await fetcher();
    cached = { value, timestamp: now };
    return value;
  };
}
