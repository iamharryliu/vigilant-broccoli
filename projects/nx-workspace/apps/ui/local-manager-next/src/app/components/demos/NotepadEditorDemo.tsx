'use client';

import { useState } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';

const DEFAULT_CONTENT = `function greet(name) {
console.log('Hello, ' + name);
}

greet('world');`;

const EDITOR_STYLE = { height: '480px' } as const;

export function NotepadEditorDemo() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  return (
    <SyncedTextEditor
      content={content}
      onChange={setContent}
      isLoading={false}
      style={EDITOR_STYLE}
    />
  );
}
