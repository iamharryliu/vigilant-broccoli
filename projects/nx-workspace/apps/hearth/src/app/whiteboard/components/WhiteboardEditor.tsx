'use client';

import { CSSProperties, ReactNode, useRef, useState, RefObject } from 'react';
import { MessageSquare, Eye, Pencil } from 'lucide-react';
import { Button, SyncedTextEditor, Text } from '@vigilant-broccoli/react-lib';
import {
  PeerCaretsOverlay,
  PeerCursorsOverlay,
} from '@vigilant-broccoli/react-lib-higher-level';
import { MarkdownViewer } from '@vigilant-broccoli/react-lib-higher-level';
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
const MARKDOWN_PREVIEW_LABEL = 'Show markdown preview';
const EDIT_MODE_LABEL = 'Back to editing';
const ICON_SIZE = 16;
const PREVIEW_CLASS_NAME = 'overflow-auto pt-10';
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
const LOAD_ERROR_TEXT = "Couldn't load these notes; editing is paused.";
const RETRY_LABEL = 'Retry';

interface WhiteboardPaneProps {
  content: string;
  isLoading: boolean;
  renderEditor: () => ReactNode;
  onOpenChat?: () => void;
  chatDisabled?: boolean;
}

function WhiteboardPane({
  content,
  isLoading,
  renderEditor,
  onOpenChat,
  chatDisabled,
}: WhiteboardPaneProps) {
  const [isPreview, setIsPreview] = useState(false);
  const previewLabel = isPreview ? EDIT_MODE_LABEL : MARKDOWN_PREVIEW_LABEL;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {isPreview ? (
        <div className={PREVIEW_CLASS_NAME} style={PANE_STYLE}>
          <MarkdownViewer content={content} />
        </div>
      ) : (
        renderEditor()
      )}
      <div className="absolute right-3 top-3 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          aria-label={previewLabel}
          title={previewLabel}
          disabled={isLoading}
          onClick={() => setIsPreview(prev => !prev)}
        >
          {isPreview ? <Pencil size={ICON_SIZE} /> : <Eye size={ICON_SIZE} />}
        </Button>
        {onOpenChat && (
          <Button
            size="sm"
            variant="outline"
            aria-label={AI_EDIT_LABEL}
            title={AI_EDIT_LABEL}
            disabled={isLoading || chatDisabled}
            onClick={onOpenChat}
          >
            <MessageSquare size={ICON_SIZE} />
          </Button>
        )}
      </div>
    </div>
  );
}

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
    <div className="relative flex min-h-0 flex-1 flex-col">
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
      <WhiteboardPane
        content={content}
        isLoading={isLoading}
        renderEditor={() => renderEditor(textareaRef, INLINE_TEXTAREA_STYLE)}
        onOpenChat={() => setAssistantOpen(true)}
        chatDisabled={!homeId}
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
          <WhiteboardPane
            content={content}
            isLoading={isLoading}
            renderEditor={() => renderEditor(dialogTextareaRef, TEXTAREA_STYLE)}
          />
        }
      />
    </div>
  );
}
