'use client';

import {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
  RefObject,
} from 'react';
import { MessageSquare, Eye, Pencil } from 'lucide-react';
import { Button, SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import { NotepadLoadError } from '@vigilant-broccoli/react-lib-higher-level';
import { MarkdownViewer } from '@vigilant-broccoli/docs-explorer';
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
const PREVIEW_SHORTCUT_LABEL = 'Cmd+Shift+V';
const MARKDOWN_PREVIEW_LABEL = `Show markdown preview (${PREVIEW_SHORTCUT_LABEL})`;
const EDIT_MODE_LABEL = `Back to editing (${PREVIEW_SHORTCUT_LABEL})`;
const PREVIEW_TOGGLE_CODE = 'KeyV';
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

interface WhiteboardPaneProps {
  content: string;
  isLoading: boolean;
  renderEditor: () => ReactNode;
  onOpenChat?: () => void;
  chatDisabled?: boolean;
  shortcutEnabled?: boolean;
}

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

function WhiteboardPane({
  content,
  isLoading,
  renderEditor,
  onOpenChat,
  chatDisabled,
  shortcutEnabled = true,
}: WhiteboardPaneProps) {
  const [isPreview, setIsPreview] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  // The textarea is unmounted while previewing, so the listener lives on
  // document to toggle back. Fields elsewhere on the page are ignored.
  useEffect(() => {
    if (!shortcutEnabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return;
      if (e.code !== PREVIEW_TOGGLE_CODE) return;
      if (
        isEditableTarget(e.target) &&
        !paneRef.current?.contains(e.target as Node)
      )
        return;
      e.preventDefault();
      setIsPreview(prev => !prev);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcutEnabled]);
  const previewLabel = isPreview ? EDIT_MODE_LABEL : MARKDOWN_PREVIEW_LABEL;

  return (
    <div ref={paneRef} className="relative flex min-h-0 flex-1 flex-col">
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
            className="hidden md:inline-flex"
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
      <NotepadLoadError loadError={loadError} onRetry={retryLoad} />
      <WhiteboardPane
        content={content}
        isLoading={isLoading}
        renderEditor={() => renderEditor(textareaRef, INLINE_TEXTAREA_STYLE)}
        onOpenChat={() => setAssistantOpen(true)}
        chatDisabled={!homeId}
        shortcutEnabled={!assistantOpen}
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
