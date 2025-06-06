import { useState } from 'react';
import { Layout } from '../layout/Layout';
import { TextArea } from '@radix-ui/themes';
import { countWords } from '@vigilant-broccoli/common-js';

export const CharacterCounterPage = () => {
  return (
    <Layout>
      <CharacterCounter />
    </Layout>
  );
};

const CharacterCounter = () => {
  const [text, setText] = useState('');
  return (
    <div className="flex">
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
  );
};
