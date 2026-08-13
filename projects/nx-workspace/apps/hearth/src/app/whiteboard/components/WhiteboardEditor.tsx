'use client';

import { CSSProperties, useRef } from 'react';
import {
  PeerCaretsOverlay,
  PeerCursorsOverlay,
  SupabaseBroadcastLike,
  SyncedTextEditor,
  useCursorPresence,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../../libs/supabase';
import { useWhiteboard } from '../../hooks/use-whiteboard';

interface WhiteboardEditorProps {
  homeId: number | null;
  token: string;
  userId: string;
  username: string;
  boardKey?: string;
  title?: string;
  placeholder?: string;
  cursorChannelPrefix?: string;
  style?: CSSProperties;
}

const DEFAULT_TITLE = 'Family Whiteboard';
const DEFAULT_PLACEHOLDER = 'Shared family notes...';
const DEFAULT_CURSOR_CHANNEL_PREFIX = 'home-whiteboard-cursors-';
const CURSOR_SEND_INTERVAL_MS = 60;

export function WhiteboardEditor({
  homeId,
  token,
  userId,
  username,
  boardKey,
  title = DEFAULT_TITLE,
  placeholder = DEFAULT_PLACEHOLDER,
  cursorChannelPrefix = DEFAULT_CURSOR_CHANNEL_PREFIX,
  style,
}: WhiteboardEditorProps) {
  const { content, setContent, isSaving, isLoading, lastSaved } = useWhiteboard(
    homeId,
    token,
    boardKey,
  );

  const { cursors, setCursorPosition, setTextCursorIndex } = useCursorPresence(
    supabase as unknown as SupabaseBroadcastLike,
    `${cursorChannelPrefix}${homeId}`,
    userId,
    username,
  );

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
      title={title}
      content={content}
      onChange={setContent}
      isSaving={isSaving}
      isLoading={isLoading}
      lastSaved={lastSaved}
      placeholder={placeholder}
      style={style}
      textareaRef={textareaRef}
      onTextareaSelect={sendTextCursorIndex}
      onTextareaBlur={handleTextareaBlur}
      onBoardMouseMove={handleBoardMouseMove}
      onBoardMouseLeave={handleBoardMouseLeave}
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
