import { IconButton } from '@radix-ui/themes';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export const CopyButton = ({
  text,
  disabled,
}: {
  text: string;
  disabled?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <IconButton variant="ghost" onClick={handleCopy} disabled={disabled}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </IconButton>
  );
};
