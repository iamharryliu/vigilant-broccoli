'use client';

import { useEffect, useRef } from 'react';

export const usePollingInterval = (
  callback: () => void | Promise<void>,
  intervalMs: number,
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    callbackRef.current();

    const interval = setInterval(() => {
      if (!document.hidden) callbackRef.current();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
};
