import { useState } from 'react';
import { Card, Heading, TextArea } from '@radix-ui/themes';
import { countWords } from '@vigilant-broccoli/common-js';

export const TextPage = () => {
  return <CharacterCounter />;
};

const CharacterCounter = () => {
  const [text, setText] = useState('');
  return (
    <Card>
      <Heading size="4" mb="2">
        Text Analysis
      </Heading>
      <div className="flex space-x-4">
        <TextArea
          className="w-1/2"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text.."
        />
        <div className="w-1/2">
          <p>Length: {text.length}</p>
          <p>Words: {countWords(text)}</p>
        </div>
      </div>
    </Card>
  );
};
