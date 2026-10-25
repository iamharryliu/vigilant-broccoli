import {
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  Ref,
  useLayoutEffect,
  useRef,
} from 'react';
import { findChangedSpan } from '../utils/text-diff.utils';

const DEFAULT_PLACEHOLDER = 'Quick notes...';
const UNDO_KEY = 'z';
const REDO_KEY = 'y';
const TAB_SIZE = 2;
const TAB_SPACES = ' '.repeat(TAB_SIZE);

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
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    backgroundColor: 'var(--color-background)',
    color: 'hsl(var(--foreground))',
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
  textareaStyle?: CSSProperties;
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

interface PendingEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

interface ViewState {
  selectionStart: number;
  selectionEnd: number;
  scrollTop: number;
}

// Maps an index in `previous` to `next` around the changed span: positions
// before it stay, positions after it shift by the length delta, positions
// inside it clamp to the new span.
const mapIndexThroughEdit = (previous: string, next: string, index: number) => {
  const { start, previousEnd, nextEnd } = findChangedSpan(previous, next);
  if (index <= start) return index;
  if (index >= previousEnd) return index + next.length - previous.length;
  return Math.min(index, nextEnd);
};

const getLineBounds = (value: string, index: number) => {
  const start = index === 0 ? 0 : value.lastIndexOf('\n', index - 1) + 1;
  const nextNewline = value.indexOf('\n', index);
  const end = nextNewline === -1 ? value.length : nextNewline;
  return { start, end };
};

const indentSelection = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  outdent: boolean,
): PendingEdit => {
  const blockStart = getLineBounds(value, selectionStart).start;
  const blockEnd = getLineBounds(value, selectionEnd).end;
  const lines = value.slice(blockStart, blockEnd).split('\n');

  let startDelta = 0;
  let totalDelta = 0;
  const newLines = lines.map((line, i) => {
    if (outdent) {
      const leadingSpaces = line.match(/^ */)?.[0].length ?? 0;
      const stripLen = Math.min(TAB_SIZE, leadingSpaces);
      if (i === 0) startDelta = -stripLen;
      totalDelta -= stripLen;
      return line.slice(stripLen);
    }
    if (i === 0) startDelta = TAB_SIZE;
    totalDelta += TAB_SIZE;
    return TAB_SPACES + line;
  });

  const newValue =
    value.slice(0, blockStart) + newLines.join('\n') + value.slice(blockEnd);

  return {
    value: newValue,
    selectionStart: Math.max(blockStart, selectionStart + startDelta),
    selectionEnd: selectionEnd + totalDelta,
  };
};

const moveLine = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  direction: -1 | 1,
): PendingEdit | null => {
  const blockStart = getLineBounds(value, selectionStart).start;
  const blockEnd = getLineBounds(value, selectionEnd).end;
  const block = value.slice(blockStart, blockEnd);

  if (direction === -1) {
    if (blockStart === 0) return null;
    const prevLineStart = value.lastIndexOf('\n', blockStart - 2) + 1;
    const prevLine = value.slice(prevLineStart, blockStart - 1);
    const newValue =
      value.slice(0, prevLineStart) +
      block +
      '\n' +
      prevLine +
      value.slice(blockEnd);
    return {
      value: newValue,
      selectionStart: prevLineStart,
      selectionEnd: prevLineStart + block.length,
    };
  }

  if (blockEnd === value.length) return null;
  const nextLineEnd = value.indexOf('\n', blockEnd + 1);
  const nextLineEndIdx = nextLineEnd === -1 ? value.length : nextLineEnd;
  const nextLine = value.slice(blockEnd + 1, nextLineEndIdx);
  const newValue =
    value.slice(0, blockStart) +
    nextLine +
    '\n' +
    block +
    value.slice(nextLineEndIdx);
  const newSelectionStart = blockStart + nextLine.length + 1;
  return {
    value: newValue,
    selectionStart: newSelectionStart,
    selectionEnd: newSelectionStart + block.length,
  };
};

const handleAltArrowKey = (
  e: KeyboardEvent<HTMLTextAreaElement>,
  textarea: HTMLTextAreaElement,
  applyEdit: (edit: PendingEdit) => void,
) => {
  e.preventDefault();
  const edit = moveLine(
    textarea.value,
    textarea.selectionStart,
    textarea.selectionEnd,
    e.key === 'ArrowUp' ? -1 : 1,
  );
  if (edit) applyEdit(edit);
};

const handleTabKey = (
  e: KeyboardEvent<HTMLTextAreaElement>,
  textarea: HTMLTextAreaElement,
  applyEdit: (edit: PendingEdit) => void,
) => {
  e.preventDefault();
  const { value, selectionStart, selectionEnd } = textarea;

  if (selectionStart === selectionEnd && !e.shiftKey) {
    applyEdit({
      value:
        value.slice(0, selectionStart) + TAB_SPACES + value.slice(selectionEnd),
      selectionStart: selectionStart + TAB_SIZE,
      selectionEnd: selectionStart + TAB_SIZE,
    });
    return;
  }

  applyEdit(indentSelection(value, selectionStart, selectionEnd, e.shiftKey));
};

const handleUndoRedoKey = (
  e: KeyboardEvent<HTMLTextAreaElement>,
  onUndo?: () => void,
  onRedo?: () => void,
) => {
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

export const SyncedTextEditor = ({
  content,
  onChange,
  isLoading,
  placeholder = DEFAULT_PLACEHOLDER,
  style,
  textareaStyle,
  textareaRef,
  onTextareaSelect,
  onTextareaBlur,
  onBoardMouseMove,
  onBoardMouseLeave,
  overlay,
  onUndo,
  onRedo,
}: SyncedTextEditorProps) => {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(
    null,
  );

  // A controlled textarea jumps its caret to the end (and scrolls) whenever
  // `value` changes from outside its own onChange — a peer's live edit, a
  // conflict merge, undo or an applied AI edit. The view is tracked from
  // events because by the layout effect React has already reset it.
  const renderedContentRef = useRef(content);
  const emittedContentRef = useRef(content);
  const viewStateRef = useRef<ViewState>({
    selectionStart: 0,
    selectionEnd: 0,
    scrollTop: 0,
  });

  const recordViewState = (textarea: HTMLTextAreaElement) => {
    viewStateRef.current = {
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
      scrollTop: textarea.scrollTop,
    };
  };

  useLayoutEffect(() => {
    const previous = renderedContentRef.current;
    renderedContentRef.current = content;
    const textarea = internalRef.current;
    if (!textarea) return;

    const pending = pendingSelectionRef.current;
    if (pending) {
      pendingSelectionRef.current = null;
      textarea.setSelectionRange(pending.start, pending.end);
      return;
    }

    const isExternal =
      content !== previous && content !== emittedContentRef.current;
    if (!isExternal || document.activeElement !== textarea) return;

    const { selectionStart, selectionEnd, scrollTop } = viewStateRef.current;
    textarea.setSelectionRange(
      mapIndexThroughEdit(previous, content, selectionStart),
      mapIndexThroughEdit(previous, content, selectionEnd),
    );
    textarea.scrollTop = scrollTop;
    recordViewState(textarea);
  }, [content]);

  const setRefs = (node: HTMLTextAreaElement | null) => {
    internalRef.current = node;
    if (typeof textareaRef === 'function') textareaRef(node);
    else if (textareaRef)
      (textareaRef as { current: HTMLTextAreaElement | null }).current = node;
  };

  const applyEdit = (edit: PendingEdit) => {
    emittedContentRef.current = edit.value;
    pendingSelectionRef.current = {
      start: edit.selectionStart,
      end: edit.selectionEnd,
    };
    onChange(edit.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;

    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      handleAltArrowKey(e, textarea, applyEdit);
      return;
    }
    if (e.key === 'Tab') {
      handleTabKey(e, textarea, applyEdit);
      return;
    }
    if (e.metaKey || e.ctrlKey) handleUndoRedoKey(e, onUndo, onRedo);
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
          ref={setRefs}
          value={content}
          onChange={e => {
            emittedContentRef.current = e.target.value;
            recordViewState(e.target);
            onChange(e.target.value);
            onTextareaSelect?.();
          }}
          onKeyDown={handleKeyDown}
          onSelect={e => {
            recordViewState(e.currentTarget);
            onTextareaSelect?.();
          }}
          onScroll={e => recordViewState(e.currentTarget)}
          onBlur={onTextareaBlur}
          disabled={isLoading}
          placeholder={placeholder}
          style={{
            ...styles.textarea,
            ...textareaStyle,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'wait' : 'text',
          }}
        />
        {overlay}
      </div>
    </div>
  );
};
