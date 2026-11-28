'use client';

import { useState } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import { MarkdownPreviewPane } from '@vigilant-broccoli/react-lib-higher-level';

const DEFAULT_CONTENT = `function greet(name) {
console.log('Hello, ' + name);
}

greet('world');`;

const EDITOR_STYLE = { height: '480px' } as const;

export function NotepadEditorDemo() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  return (
    <MarkdownPreviewPane
      markdownPreview
      content={content}
      style={EDITOR_STYLE}
      renderEditor={() => (
        <SyncedTextEditor
          content={content}
          onChange={setContent}
          isLoading={false}
        />
      )}
    />
  );
}
