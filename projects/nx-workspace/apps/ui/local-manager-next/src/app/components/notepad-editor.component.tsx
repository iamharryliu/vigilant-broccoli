'use client';

import { CSSProperties } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import {
  MarkdownPreviewPane,
  NotepadLoadError,
} from '@vigilant-broccoli/react-lib-higher-level';
import { useNotepad } from '../context/NotepadContext';

interface NotepadEditorProps {
  style?: CSSProperties;
}

export const NotepadEditorComponent = ({ style }: NotepadEditorProps) => {
  const { content, setContent, isLoading, loadError, retryLoad, undo, redo } =
    useNotepad();

  return (
    <>
      <NotepadLoadError loadError={loadError} onRetry={retryLoad} />
      <MarkdownPreviewPane
        markdownPreview
        content={content}
        isLoading={isLoading}
        style={style}
        renderEditor={() => (
          <SyncedTextEditor
            content={content}
            onChange={setContent}
            isLoading={isLoading}
            onUndo={undo}
            onRedo={redo}
          />
        )}
      />
    </>
  );
};
