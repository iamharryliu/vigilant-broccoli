'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from '@vigilant-broccoli/react-lib';

const TOAST_ID = 'socket-cert-trust';
const TOAST_TITLE = 'Cannot reach realtime server';
const TOAST_DESCRIPTION =
  'The server uses a self-signed certificate your browser does not trust. Open it in a new tab, accept the warning, then return here.';
const TOAST_ACTION_LABEL = 'Trust certificate';
const CERT_ERROR_PATTERNS = [
  'xhr poll error',
  'websocket error',
  'transport error',
  'TransportError',
];
const WINDOW_TARGET_BLANK = '_blank';

const looksLikeCertError = (err: Error) => {
  const msg = (err.message || '').toLowerCase();
  return CERT_ERROR_PATTERNS.some(p => msg.includes(p.toLowerCase()));
};

export function useSocketWithCertTrustPrompt(
  url: string | undefined,
  options?: Parameters<typeof io>[1],
) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const certPromptShownRef = useRef(false);

  useEffect(() => {
    if (!url) return;
    const s = io(url, options);
    setSocket(s);

    s.on('connect', () => {
      if (certPromptShownRef.current) {
        toast.dismiss(TOAST_ID);
        certPromptShownRef.current = false;
      }
    });

    s.on('connect_error', err => {
      if (certPromptShownRef.current) return;
      if (!looksLikeCertError(err)) return;
      certPromptShownRef.current = true;
      toast.error(TOAST_TITLE, {
        id: TOAST_ID,
        description: TOAST_DESCRIPTION,
        duration: Infinity,
        action: {
          label: TOAST_ACTION_LABEL,
          onClick: () => window.open(url, WINDOW_TARGET_BLANK),
        },
      });
    });

    return () => {
      s.close();
      setSocket(null);
    };
  }, [url]);

  return socket;
}
