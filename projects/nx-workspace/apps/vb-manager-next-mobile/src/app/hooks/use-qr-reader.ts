'use client';

import { useCallback, useState } from 'react';
import { decodeQrFromFile, toOpenableUrl } from '../utils/qr.utils';

export type QrReaderStatus = 'idle' | 'decoding' | 'done';

const ERROR_MESSAGE = 'Failed to read the image. Please try another one.';

export const useQrReader = () => {
  const [status, setStatus] = useState<QrReaderStatus>('idle');
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = useCallback(async (file: File) => {
    setStatus('decoding');
    setValue(null);
    setError(null);
    try {
      setValue(await decodeQrFromFile(file));
      setStatus('done');
    } catch {
      setError(ERROR_MESSAGE);
      setStatus('idle');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setValue(null);
    setError(null);
  }, []);

  return {
    status,
    value,
    url: value ? toOpenableUrl(value) : null,
    error,
    decode,
    reset,
  };
};
