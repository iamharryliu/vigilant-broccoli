'use client';

import { CSSProperties } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import { useNotepad } from '../hooks/useNotepad';

interface NotepadEditorProps {
  style?: CSSProperties;
}

const TITLE = 'Notepad';

export const NotepadEditorComponent = ({ style }: NotepadEditorProps) => {
  const { content, setContent, isSaving, isLoading, lastSaved } = useNotepad();

  return (
    <SyncedTextEditor
      title={TITLE}
      content={content}
      onChange={setContent}
      isSaving={isSaving}
      isLoading={isLoading}
      lastSaved={lastSaved}
      style={style}
    />
  );
};
