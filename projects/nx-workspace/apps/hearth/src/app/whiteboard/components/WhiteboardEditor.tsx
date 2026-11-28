'use client';

import { CSSProperties, useRef, useState, RefObject } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button, SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import {
  MarkdownPreviewPane,
  NotepadLoadError,
} from '@vigilant-broccoli/react-lib-higher-level';
import {
  PeerCaretsOverlay,
  PeerCursorsOverlay,
} from '@vigilant-broccoli/realtime';
import { useWhiteboard } from '../../hooks/use-whiteboard';
import { WhiteboardAssistantDialog } from './WhiteboardAssistantDialog';

interface WhiteboardEditorProps {
  homeId: number | null;
  token: string;
  userId: string;
  username: string;
  boardKey?: string;
  placeholder?: string;
}

const DEFAULT_BOARD_KEY = 'family';
const AI_EDIT_LABEL = 'AI edit';
const ICON_SIZE = 16;
const PANE_CLASS_NAME = 'flex-1';
const PANE_STYLE: CSSProperties = { flex: 1, minHeight: 0 };
// iOS Safari zooms the page into any focused field under 16px.
const TEXTAREA_STYLE: CSSProperties = { fontSize: '16px' };
// The editor's default 200px textarea floor would push the caret behind the
// on-screen keyboard once the page shrinks to the visual viewport.
const INLINE_TEXTAREA_STYLE: CSSProperties = {
  ...TEXTAREA_STYLE,
  minHeight: 0,
};
const DEFAULT_PLACEHOLDER = 'Shared family notes...';
const CURSOR_SEND_INTERVAL_MS = 60;

export function WhiteboardEditor({
  homeId,
  token,
  userId,
  username,
  boardKey = DEFAULT_BOARD_KEY,
  placeholder = DEFAULT_PLACEHOLDER,
}: WhiteboardEditorProps) {
  const {
    content,
    setContent,
    isLoading,
    loadError,
    retryLoad,
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
    textareaStyle?: CSSProperties,
  ) => (
    <SyncedTextEditor
      content={content}
      onChange={setContent}
      isLoading={isLoading}
      placeholder={placeholder}
      style={PANE_STYLE}
      textareaStyle={textareaStyle}
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
    <div className="flex min-h-0 flex-1 flex-col">
      <NotepadLoadError loadError={loadError} onRetry={retryLoad} />
      <MarkdownPreviewPane
        markdownPreview
        className={PANE_CLASS_NAME}
        content={content}
        isLoading={isLoading}
        renderEditor={() => renderEditor(textareaRef, INLINE_TEXTAREA_STYLE)}
        shortcutEnabled={!assistantOpen}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="hidden md:inline-flex"
            aria-label={AI_EDIT_LABEL}
            title={AI_EDIT_LABEL}
            disabled={isLoading || !homeId}
            onClick={() => setAssistantOpen(true)}
          >
            <MessageSquare size={ICON_SIZE} />
          </Button>
        }
      />
      <WhiteboardAssistantDialog
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        homeId={homeId}
        boardKey={boardKey}
        token={token}
        content={content}
        setContent={setContent}
        editor={
          <MarkdownPreviewPane
            markdownPreview
            className={PANE_CLASS_NAME}
            content={content}
            isLoading={isLoading}
            renderEditor={() => renderEditor(dialogTextareaRef, TEXTAREA_STYLE)}
          />
        }
      />
    </div>
  );
}
