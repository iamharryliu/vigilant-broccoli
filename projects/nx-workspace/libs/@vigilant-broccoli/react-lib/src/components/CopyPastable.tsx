import { Button, Card } from '@radix-ui/themes';
import { Copy } from 'lucide-react';

export const CopyPastable = ({ text }: { text: string }) => {
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
     <pre className="whitespace-pre-wrap break-words">{text}</pre>
    </Card>
  );
};
