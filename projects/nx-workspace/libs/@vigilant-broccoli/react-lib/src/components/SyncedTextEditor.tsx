import { CSSProperties, ReactNode, Ref } from 'react';

const LOADING_LABEL = 'Loading...';
const DEFAULT_PLACEHOLDER = 'Quick notes...';

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
}: SyncedTextEditorProps) => (
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
