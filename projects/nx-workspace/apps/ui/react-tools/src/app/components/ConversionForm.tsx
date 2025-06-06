import { Card, TextArea, Heading } from '@radix-ui/themes';
import { useState } from 'react';
import { CopyPastable } from '../lib/components/CopyPastable';

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

  return (
    <Card>
      <Heading size="4" mb="2">
        {copy.header}
      </Heading>
      <div className="flex space-x-4">
        <TextArea
          className="w-1/2"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={copy.placeholder}
          size="3"
        />
        <div className="w-1/2">
          <CopyPastable text={conversionFn(text)} />
        </div>
      </div>
    </Card>
  );
};
