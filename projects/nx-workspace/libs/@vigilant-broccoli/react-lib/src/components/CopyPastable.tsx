import { Button, Card, ScrollArea } from '@radix-ui/themes';
import { Copy } from 'lucide-react';

export const CopyPastable = ({
  text,
  // TODO: investigate wrapping
  isScrollable,
  placeholder,
  isResultEmpty,
}: {
  text: string;
  isScrollable?: boolean;
  placeholder?: string;
  isResultEmpty?: boolean;
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const shouldShowPlaceholder = !!(isResultEmpty && placeholder);
  const displayText = shouldShowPlaceholder ? placeholder : text;

  return (
    <Card className={`bg-gray-100 dark:bg-gray-800 h-full ${shouldShowPlaceholder ? 'text-gray-500 dark:text-gray-400' : ''}`}>
      <div className="absolute top-2 right-2 ">
        <Button variant="ghost" onClick={handleCopy} disabled={shouldShowPlaceholder}>
          <Copy />
        </Button>
      </div>

      {isScrollable ? (
        <ScrollArea type="always" scrollbars="vertical" style={{ height: 180 }}>
          <pre className="whitespace-pre-wrap break-all">{displayText}</pre>
        </ScrollArea>
      ) : (
        <pre className="whitespace-pre-wrap break-all">{displayText}</pre>
      )}
    </Card>
  );
};
