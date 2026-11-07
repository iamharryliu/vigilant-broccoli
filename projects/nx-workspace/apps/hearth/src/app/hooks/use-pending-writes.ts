'use client';

import { useCallback, useRef, useState } from 'react';

export const assertOk = (res: Response) => {
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res;
};

/**
 * Optimistic checklist writes per row id: `isPending` guards repeat toggles
 * before the next render, `pendingIds` feeds each row's `isRemoving`, and
 * `rollback` restores the optimistic change when the request throws.
 */
export function usePendingWrites() {
  const inFlight = useRef(new Set<string>());
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const isPending = useCallback((id: string) => inFlight.current.has(id), []);

  const write = useCallback(
    async (
      id: string,
      request: () => Promise<unknown>,
      rollback: () => void,
    ) => {
      inFlight.current.add(id);
      setPendingIds(new Set(inFlight.current));
      try {
        await request();
      } catch {
        rollback();
      } finally {
        inFlight.current.delete(id);
        setPendingIds(new Set(inFlight.current));
      }
    },
    [],
  );

  return { pendingIds, isPending, write };
}
