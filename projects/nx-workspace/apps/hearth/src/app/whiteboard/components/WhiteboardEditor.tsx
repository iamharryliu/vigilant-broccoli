'use client';

import { CSSProperties, useRef } from 'react';
import {
  PeerCaretsOverlay,
  PeerCursorsOverlay,
  SyncedTextEditor,
} from '@vigilant-broccoli/react-lib';
import { useWhiteboard } from '../../hooks/use-whiteboard';

interface WhiteboardEditorProps {
  homeId: number | null;
  token: string;
  userId: string;
  username: string;
  boardKey?: string;
  placeholder?: string;
  style?: CSSProperties;
}

const DEFAULT_PLACEHOLDER = 'Shared family notes...';
const CURSOR_SEND_INTERVAL_MS = 60;

export function WhiteboardEditor({
  homeId,
  token,
  userId,
  username,
  boardKey,
  placeholder = DEFAULT_PLACEHOLDER,
  style,
}: WhiteboardEditorProps) {
  const {
    content,
    setContent,
    isLoading,
    undo,
    redo,
    cursors,
    setCursorPosition,
    setTextCursorIndex,
  } = useWhiteboard(homeId, token, userId, username, boardKey);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastCursorSentAtRef = useRef(0);
  const lastIndexSentAtRef = useRef(0);

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastCursorSentAtRef.current < CURSOR_SEND_INTERVAL_MS) return;
    lastCursorSentAtRef.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setCursorPosition(
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
    );
  };

  const handleBoardMouseLeave = () => setCursorPosition(null, null);

  const sendTextCursorIndex = () => {
    const now = Date.now();
    if (now - lastIndexSentAtRef.current < CURSOR_SEND_INTERVAL_MS) return;
    lastIndexSentAtRef.current = now;
    const textarea = textareaRef.current;
    if (!textarea) return;
    setTextCursorIndex(textarea.selectionStart);
  };

  const handleTextareaBlur = () => setTextCursorIndex(null);

  return (
    <SyncedTextEditor
      content={content}
      onChange={setContent}
      isLoading={isLoading}
      placeholder={placeholder}
      style={style}
      textareaRef={textareaRef}
      onTextareaSelect={sendTextCursorIndex}
      onTextareaBlur={handleTextareaBlur}
      onBoardMouseMove={handleBoardMouseMove}
      onBoardMouseLeave={handleBoardMouseLeave}
      onUndo={undo}
      onRedo={redo}
      overlay={
        <>
          <PeerCaretsOverlay
            cursors={cursors}
            currentUserId={userId}
            content={content}
            textareaRef={textareaRef}
          />
          <PeerCursorsOverlay cursors={cursors} currentUserId={userId} />
        </>
      }
    />
  );
}
