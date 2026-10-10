'use client';

import { CSSProperties, ReactNode, useRef, useState, RefObject } from 'react';
import { MessageSquare, Eye, Pencil } from 'lucide-react';
import {
  Button,
  PeerCaretsOverlay,
  PeerCursorsOverlay,
  SyncedTextEditor,
} from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from '@vigilant-broccoli/react-utility';
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
const MARKDOWN_PREVIEW_LABEL = 'Show markdown preview';
const EDIT_MODE_LABEL = 'Back to editing';
const ICON_SIZE = 16;
const PREVIEW_CLASS_NAME = 'overflow-auto pt-10';
const PANE_STYLE: CSSProperties = { flex: 1, minHeight: 0 };
const DEFAULT_PLACEHOLDER = 'Shared family notes...';
const CURSOR_SEND_INTERVAL_MS = 60;

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
      <WhiteboardPane
        content={content}
        isLoading={isLoading}
        renderEditor={() => renderEditor(textareaRef, PANE_STYLE)}
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
            renderEditor={() => renderEditor(dialogTextareaRef, PANE_STYLE)}
          />
        }
      />
    </div>
  );
}
