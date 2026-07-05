'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from '@vigilant-broccoli/react-lib';
import { errorMessage } from './api-helpers';

type RunOptions = {
  success?: string;
  error?: string;
};

export const useAction = () => {
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);

  const run = useCallback(
    async (action: () => Promise<void>, options: RunOptions = {}) => {
      if (runningRef.current) return;
      runningRef.current = true;
      setRunning(true);
      try {
        await action();
        if (options.success) toast.success(options.success);
      } catch (err) {
        toast.error(errorMessage(err, options.error));
      } finally {
        runningRef.current = false;
        setRunning(false);
      }
    },
    [],
  );

  return { running, run };
};
