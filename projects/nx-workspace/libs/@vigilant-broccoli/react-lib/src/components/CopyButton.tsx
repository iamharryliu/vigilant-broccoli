import { useState } from 'react';
import { IconButton } from './IconButton';

const COPY_RESET_MS = 1000;

export const CopyButton = ({
  text,
  disabled,
}: {
  text: string | (() => Promise<string>);
  disabled?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const value = typeof text === 'function' ? await text() : text;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_RESET_MS);
  };

  return (
    <IconButton
      variant="ghost"
      icon={copied ? 'check' : 'copy'}
      onClick={handleCopy}
      disabled={disabled}
    />
  );
};
