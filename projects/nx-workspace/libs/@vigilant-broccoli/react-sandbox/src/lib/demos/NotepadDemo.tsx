import { CSSProperties, useState } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';

const DEFAULT_CONTENT = `function greet(name) {
console.log('Hello, ' + name);
}

greet('world');`;

const EDITOR_STYLE = { height: '360px' } as const;

interface NotepadDemoProps {
  initialContent?: string;
  style?: CSSProperties;
}

export const NotepadDemo = ({
  initialContent = DEFAULT_CONTENT,
  style = EDITOR_STYLE,
}: NotepadDemoProps) => {
  const [content, setContent] = useState(initialContent);

  return (
    <SyncedTextEditor
      content={content}
      onChange={setContent}
      isLoading={false}
      style={style}
    />
  );
};
