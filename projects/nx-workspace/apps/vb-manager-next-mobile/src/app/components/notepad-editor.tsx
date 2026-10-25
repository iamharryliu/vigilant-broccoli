'use client';

import { CSSProperties } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import { NotepadLoadError } from '@vigilant-broccoli/react-lib-higher-level';
import { useNotepad } from '../hooks/use-notepad';

interface NotepadEditorProps {
  style?: CSSProperties;
}

export const NotepadEditor = ({ style }: NotepadEditorProps) => {
  const { content, setContent, isLoading, loadError, retryLoad, undo, redo } =
    useNotepad();

  return (
    <>
      <NotepadLoadError loadError={loadError} onRetry={retryLoad} />
      <SyncedTextEditor
        content={content}
        onChange={setContent}
        isLoading={isLoading}
        onUndo={undo}
        onRedo={redo}
        style={style}
      />
    </>
  );
};
