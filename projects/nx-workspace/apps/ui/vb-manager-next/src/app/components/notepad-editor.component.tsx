'use client';

import { CSSProperties } from 'react';
import { Card, Flex, Text } from '@radix-ui/themes';
import { useNotepad } from '../hooks/useNotepad';

interface NotepadEditorProps {
  style?: CSSProperties;
}

export const NotepadEditorComponent = ({ style }: NotepadEditorProps) => {
  const { content, setContent, isSaving, lastSaved } = useNotepad();

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', ...style }}>
      <Flex direction="column" gap="2" style={{ flex: 1 }}>
        <Flex justify="between" align="center">
          <Text size="2" weight="bold">
            Notepad
          </Text>
          <Text size="1" color="gray">
            {isSaving
              ? 'Saving...'
              : lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString()}`
                : ''}
          </Text>
        </Flex>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Quick notes..."
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
          }}
        />
      </Flex>
    </Card>
  );
};
