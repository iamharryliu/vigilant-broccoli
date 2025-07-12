import { Button, Card, ScrollArea } from '@radix-ui/themes';
import { Copy } from 'lucide-react';

export const CopyPastable = ({
  text,
  // TODO: investigate wrapping
  isScrollable,
}: {
  text: string;
  isScrollable?: boolean;
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <Card className="bg-gray-100 h-full">
      <div className="absolute top-2 right-2 ">
        <Button variant="ghost" onClick={handleCopy}>
          <Copy />
        </Button>
      </div>

      {isScrollable ? (
        <ScrollArea type="always" scrollbars="vertical" style={{ height: 180 }}>
          <pre className="whitespace-pre-wrap break-all">{text}</pre>
        </ScrollArea>
      ) : (
        <pre className="whitespace-pre-wrap break-all">{text}</pre>
      )}
    </Card>
  );
};
