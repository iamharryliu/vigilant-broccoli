import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';

const COPY_RESET_MS = 1000;

export const CopyButton = ({
  text,
  disabled,
}: {
  text: string;
  disabled?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_RESET_MS);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} disabled={disabled}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </Button>
  );
};
