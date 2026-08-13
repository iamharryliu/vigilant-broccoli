'use client';

import { CSSProperties } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import { useNotepad } from '../hooks/useNotepad';

interface NotepadEditorProps {
  style?: CSSProperties;
}

export const NotepadEditorComponent = ({ style }: NotepadEditorProps) => {
  const { content, setContent, isLoading } = useNotepad();

  return (
    <SyncedTextEditor
      content={content}
      onChange={setContent}
      isLoading={isLoading}
      style={style}
    />
  );
};
