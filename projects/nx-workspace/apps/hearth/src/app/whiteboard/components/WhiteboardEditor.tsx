'use client';

import { CSSProperties, useRef, useState, RefObject } from 'react';
import {
  Button,
  PeerCaretsOverlay,
  PeerCursorsOverlay,
  SyncedTextEditor,
} from '@vigilant-broccoli/react-lib';
import { useWhiteboard } from '../../hooks/use-whiteboard';
import { WhiteboardAssistantDialog } from './WhiteboardAssistantDialog';

interface WhiteboardEditorProps {
  homeId: number | null;
  token: string;
  userId: string;
  username: string;
  boardKey?: string;
  placeholder?: string;
  style?: CSSProperties;
}

const DEFAULT_BOARD_KEY = 'family';
const AI_EDIT_LABEL = 'AI edit';
const DEFAULT_PLACEHOLDER = 'Shared family notes...';
const CURSOR_SEND_INTERVAL_MS = 60;

export function WhiteboardEditor({
  homeId,
  token,
  userId,
  username,
  boardKey = DEFAULT_BOARD_KEY,
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

  const [assistantOpen, setAssistantOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogTextareaRef = useRef<HTMLTextAreaElement>(null);
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

  const sendTextCursorIndex = (ref: RefObject<HTMLTextAreaElement | null>) => {
    const now = Date.now();
    if (now - lastIndexSentAtRef.current < CURSOR_SEND_INTERVAL_MS) return;
    lastIndexSentAtRef.current = now;
    const textarea = ref.current;
    if (!textarea) return;
    setTextCursorIndex(textarea.selectionStart);
  };

  const handleTextareaBlur = () => setTextCursorIndex(null);

  const renderEditor = (
    ref: RefObject<HTMLTextAreaElement | null>,
    editorStyle?: CSSProperties,
  ) => (
    <SyncedTextEditor
      content={content}
      onChange={setContent}
      isLoading={isLoading}
      placeholder={placeholder}
      style={editorStyle}
      textareaRef={ref}
      onTextareaSelect={() => sendTextCursorIndex(ref)}
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
            textareaRef={ref}
          />
          <PeerCursorsOverlay cursors={cursors} currentUserId={userId} />
        </>
      }
    />
  );

  return (
    <div
      className="relative flex flex-col"
      style={{ display: 'flex', flexDirection: 'column', ...style }}
    >
      {renderEditor(textareaRef, { flex: 1, minHeight: 0 })}
      <Button
        size="sm"
        variant="outline"
        className="absolute right-3 top-3"
        disabled={isLoading || !homeId}
        onClick={() => setAssistantOpen(true)}
      >
        {AI_EDIT_LABEL}
      </Button>
      <WhiteboardAssistantDialog
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        homeId={homeId}
        boardKey={boardKey}
        token={token}
        content={content}
        setContent={setContent}
        editor={renderEditor(dialogTextareaRef, { flex: 1, minHeight: 0 })}
      />
    </div>
  );
}
