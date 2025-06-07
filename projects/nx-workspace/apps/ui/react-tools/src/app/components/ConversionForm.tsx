import { Card, TextArea, Heading } from '@radix-ui/themes';
import { CopyPastable } from '@vigilant-broccoli/react-lib';
import { useCallback, useState } from 'react';

export const ConversionForm = ({
  copy,
  initialText,
  conversionFn,
}: {
  copy: Record<string, string>;
  initialText: string;
  conversionFn: (text: string) => string;
}) => {
  const [text, setText] = useState(initialText);
  const [isDragging, setIsDragging] = useState(false);

  const isSupportedFile = (file: File) => {
    const supportedTypes = ['text/', 'application/json', 'application/csv'];
    const supportedExtensions = ['.txt', '.json', '.csv'];

    const mimeOk = supportedTypes.some(type => file.type.startsWith(type));
    const extOk = supportedExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    return mimeOk || extOk;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && isSupportedFile(file)) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result;
        console.log(result)
        if (typeof result === 'string') {
          console.log('hit ')
          setText(result);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Unsupported file type. Please drop a .txt, .json, or .csv file.');
    }
  }, []);

  return (
    <Card>
      <Heading size="4" mb="2">
        {copy.header}
      </Heading>
      <div className="flex space-x-4">
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`w-1/2 border-2 rounded-md ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-transparent'
          }`}
        >
          <TextArea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={copy.placeholder}
            size="3"
          />
        </div>
        <div className="w-1/2">
          <CopyPastable text={conversionFn(text)} />
        </div>
      </div>
    </Card>
  );
};
