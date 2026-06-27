'use client';

import { CSSProperties } from 'react';
import { Text } from '@radix-ui/themes';
import { useNotepad } from '../hooks/useNotepad';

interface NotepadEditorProps {
  style?: CSSProperties;
}

export const NotepadEditorComponent = ({ style }: NotepadEditorProps) => {
  const { content, setContent, isSaving, isLoading, lastSaved } = useNotepad();

  return (
    <div
      className="flex flex-col gap-2"
      style={{ display: 'flex', flexDirection: 'column', ...style }}
    >
      <div className="flex justify-between items-center">
        <Text size="2" weight="bold">
          Notepad
        </Text>
        <Text size="1" color="gray">
          {isLoading
            ? 'Loading...'
            : isSaving
              ? 'Saving...'
              : lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString()}`
                : ''}
        </Text>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={isLoading}
        placeholder={isLoading ? 'Loading...' : 'Quick notes...'}
        style={{
          flex: 1,
          resize: 'none',
          border: '1px solid var(--gray-6)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          backgroundColor: 'var(--color-background)',
          color: 'var(--gray-12)',
          outline: 'none',
          minHeight: '200px',
          opacity: isLoading ? 0.6 : 1,
          cursor: isLoading ? 'wait' : 'text',
        }}
      />
    </div>
  );
};
