'use client';

import { useCallback, useState } from 'react';
import { preprocessForOcr } from '../utils/image.utils';

export type OcrStatus = 'idle' | 'processing' | 'done';

const LANG = 'eng';
const STATUS_RECOGNIZING = 'recognizing text';
const ERROR_MESSAGE = 'Failed to read text from the image. Please try again.';

export const useOcr = () => {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognize = useCallback(async (image: File) => {
    setStatus('processing');
    setProgress(0);
    setError(null);
    try {
      const [{ createWorker }, processedImage] = await Promise.all([
        import('tesseract.js'),
        preprocessForOcr(image),
      ]);
      const worker = await createWorker(LANG, undefined, {
        logger: message => {
          if (message.status === STATUS_RECOGNIZING) {
            setProgress(Math.round(message.progress * 100));
          }
        },
      });
      const {
        data: { text: recognizedText },
      } = await worker.recognize(processedImage);
      await worker.terminate();
      setText(recognizedText.trim());
      setStatus('done');
    } catch {
      setError(ERROR_MESSAGE);
      setStatus('idle');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setText('');
    setError(null);
  }, []);

  return { status, progress, text, error, recognize, reset, setText };
};
