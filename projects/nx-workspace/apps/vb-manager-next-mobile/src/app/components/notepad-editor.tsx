'use client';

import { CSSProperties } from 'react';
import { Button, SyncedTextEditor, Text } from '@vigilant-broccoli/react-lib';
import { useNotepad } from '../hooks/use-notepad';

const LOAD_ERROR_TEXT = "Couldn't load these notes; editing is paused.";
const RETRY_LABEL = 'Retry';

interface NotepadEditorProps {
  style?: CSSProperties;
}

export const NotepadEditor = ({ style }: NotepadEditorProps) => {
  const { content, setContent, isLoading, loadError, retryLoad, undo, redo } =
    useNotepad();

  return (
    <>
      {loadError && (
        <div className="mb-2 flex items-center gap-2" role="alert">
          <Text size="2" color="red">
            {LOAD_ERROR_TEXT}
          </Text>
          <Button size="sm" variant="outline" onClick={retryLoad}>
            {RETRY_LABEL}
          </Button>
        </div>
      )}
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
