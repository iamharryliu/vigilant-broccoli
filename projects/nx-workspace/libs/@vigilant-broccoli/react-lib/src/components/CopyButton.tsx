import { useState } from 'react';
import { IconButton } from './IconButton';

const COPY_RESET_MS = 1000;

const COPY_STATUS = {
  IDLE: 'idle',
  COPIED: 'copied',
  FAILED: 'failed',
} as const;

type CopyStatus = (typeof COPY_STATUS)[keyof typeof COPY_STATUS];

const DEFAULT_LABEL = 'Copy';

const STATUS_DISPLAY = {
  [COPY_STATUS.COPIED]: { icon: 'check', label: 'Copied' },
  [COPY_STATUS.FAILED]: { icon: 'x', label: 'Copy failed' },
} as const;

export const CopyButton = ({
  text,
  disabled,
  skipBrowserCopy,
  label = DEFAULT_LABEL,
}: {
  text: string | (() => Promise<string>);
  disabled?: boolean;
  skipBrowserCopy?: boolean;
  label?: string;
}) => {
  const [status, setStatus] = useState<CopyStatus>(COPY_STATUS.IDLE);

  const handleCopy = async () => {
    // Clipboard writes reject on insecure origins or denied permissions;
    // without this the click silently does nothing.
    try {
      const value = typeof text === 'function' ? await text() : text;
      if (!skipBrowserCopy) {
        await navigator.clipboard.writeText(value);
      }
      setStatus(COPY_STATUS.COPIED);
    } catch {
      setStatus(COPY_STATUS.FAILED);
    }
    setTimeout(() => setStatus(COPY_STATUS.IDLE), COPY_RESET_MS);
  };

  const display =
    status === COPY_STATUS.IDLE
      ? ({ icon: 'copy', label } as const)
      : STATUS_DISPLAY[status];

  return (
    <IconButton
      variant="ghost"
      icon={display.icon}
      onClick={handleCopy}
      disabled={disabled}
      aria-label={display.label}
      title={display.label}
    />
  );
};
