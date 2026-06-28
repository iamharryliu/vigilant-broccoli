'use client';

import { CSSProperties } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import { useWhiteboard } from '../../hooks/use-whiteboard';

interface WhiteboardEditorProps {
  homeId: number | null;
  token: string;
  style?: CSSProperties;
}

const TITLE = 'Family Whiteboard';
const PLACEHOLDER = 'Shared family notes...';

export function WhiteboardEditor({
  homeId,
  token,
  style,
}: WhiteboardEditorProps) {
  const { content, setContent, isSaving, isLoading, lastSaved } = useWhiteboard(
    homeId,
    token,
  );

  return (
    <SyncedTextEditor
      title={TITLE}
      content={content}
      onChange={setContent}
      isSaving={isSaving}
      isLoading={isLoading}
      lastSaved={lastSaved}
      placeholder={PLACEHOLDER}
      style={style}
    />
  );
}
