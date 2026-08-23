import { CSSProperties, KeyboardEvent, ReactNode, Ref } from 'react';

const LOADING_LABEL = 'Loading...';
const DEFAULT_PLACEHOLDER = 'Quick notes...';
const UNDO_KEY = 'z';
const REDO_KEY = 'y';

const styles = {
  board: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  textarea: {
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
  },
} as const;

interface SyncedTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  isLoading: boolean;
  placeholder?: string;
  style?: CSSProperties;
  textareaRef?: Ref<HTMLTextAreaElement>;
  onTextareaSelect?: () => void;
  onTextareaBlur?: () => void;
  onBoardMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onBoardMouseLeave?: () => void;
  overlay?: ReactNode;
  // When provided, ctrl/cmd+Z and ctrl/cmd+shift+Z (or ctrl+Y) call these
  // instead of the browser's native undo, which isn't aware of edits merged
  // in live from other collaborators. Omit to keep native undo behavior.
  onUndo?: () => void;
  onRedo?: () => void;
}

export const SyncedTextEditor = ({
  content,
  onChange,
  isLoading,
  placeholder = DEFAULT_PLACEHOLDER,
  style,
  textareaRef,
  onTextareaSelect,
  onTextareaBlur,
  onBoardMouseMove,
  onBoardMouseLeave,
  overlay,
  onUndo,
  onRedo,
}: SyncedTextEditorProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();

    if (key === UNDO_KEY && !e.shiftKey && onUndo) {
      e.preventDefault();
      onUndo();
      return;
    }
    if ((key === REDO_KEY || (key === UNDO_KEY && e.shiftKey)) && onRedo) {
      e.preventDefault();
      onRedo();
    }
  };

  return (
    <div
      className="flex flex-col gap-2"
      style={{ display: 'flex', flexDirection: 'column', ...style }}
    >
      <div
        style={styles.board}
        onMouseMove={onBoardMouseMove}
        onMouseLeave={onBoardMouseLeave}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => {
            onChange(e.target.value);
            onTextareaSelect?.();
          }}
          onKeyDown={handleKeyDown}
          onSelect={onTextareaSelect}
          onBlur={onTextareaBlur}
          disabled={isLoading}
          placeholder={isLoading ? LOADING_LABEL : placeholder}
          style={{
            ...styles.textarea,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'wait' : 'text',
          }}
        />
        {overlay}
      </div>
    </div>
  );
};
