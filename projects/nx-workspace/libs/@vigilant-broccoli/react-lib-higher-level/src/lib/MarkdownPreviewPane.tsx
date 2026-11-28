'use client';

import {
  CSSProperties,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Eye, Pencil } from 'lucide-react';
import { Button, cn } from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from '@vigilant-broccoli/docs-explorer';

const PREVIEW_SHORTCUT_LABEL = 'Cmd+Shift+V';
const PREVIEW_TOGGLE_CODE = 'KeyV';
const DEFAULT_PREVIEW_LABEL = 'Show markdown preview';
const DEFAULT_EDIT_LABEL = 'Back to editing';
const ICON_SIZE = 16;
const EDITABLE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

interface MarkdownPreviewPaneProps {
  content: string;
  renderEditor: () => ReactNode;
  /** Off renders only the editor: no toggle button, listener or shortcut. */
  markdownPreview?: boolean;
  defaultPreview?: boolean;
  isLoading?: boolean;
  /** Turn off while another pane (such as a dialog) owns the shortcut. */
  shortcutEnabled?: boolean;
  /** Extra buttons shown beside the preview toggle. */
  actions?: ReactNode;
  previewLabel?: string;
  editLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || EDITABLE_TAGS.includes(target.tagName));

// Plain Cmd/Ctrl+V never matches, so paste is untouched. Fields outside the
// pane are ignored so the shortcut does not fire from unrelated inputs.
const isPreviewShortcut = (e: KeyboardEvent, pane: HTMLElement | null) =>
  (e.metaKey || e.ctrlKey) &&
  e.shiftKey &&
  e.code === PREVIEW_TOGGLE_CODE &&
  !(isEditableTarget(e.target) && !pane?.contains(e.target as Node));

// The editor is unmounted while previewing, so the listener lives on
// document to toggle back.
const usePreviewShortcut = (
  enabled: boolean,
  paneRef: RefObject<HTMLDivElement | null>,
  toggle: () => void,
) => {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPreviewShortcut(e, paneRef.current)) return;
      e.preventDefault();
      toggle();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, paneRef, toggle]);
};

interface PreviewToggleProps {
  showPreview: boolean;
  isLoading?: boolean;
  previewLabel?: string;
  editLabel?: string;
  onToggle: () => void;
}

const PreviewToggle = ({
  showPreview,
  isLoading = false,
  previewLabel = DEFAULT_PREVIEW_LABEL,
  editLabel = DEFAULT_EDIT_LABEL,
  onToggle,
}: PreviewToggleProps) => {
  const label = `${showPreview ? editLabel : previewLabel} (${PREVIEW_SHORTCUT_LABEL})`;
  return (
    <Button
      size="sm"
      variant="outline"
      aria-label={label}
      title={label}
      disabled={isLoading}
      onClick={onToggle}
    >
      {showPreview ? <Pencil size={ICON_SIZE} /> : <Eye size={ICON_SIZE} />}
    </Button>
  );
};

export function MarkdownPreviewPane({
  content,
  renderEditor,
  markdownPreview = false,
  defaultPreview = false,
  shortcutEnabled = true,
  actions,
  className,
  style,
  ...toggleProps
}: MarkdownPreviewPaneProps) {
  const [isPreview, setIsPreview] = useState(defaultPreview);
  const paneRef = useRef<HTMLDivElement>(null);
  const toggle = useCallback(() => setIsPreview(prev => !prev), []);
  usePreviewShortcut(markdownPreview && shortcutEnabled, paneRef, toggle);

  if (!markdownPreview && !actions) return renderEditor();

  const showPreview = markdownPreview && isPreview;

  return (
    <div
      ref={paneRef}
      className={cn('flex min-h-0 flex-col gap-1', className)}
      style={style}
    >
      <div className="flex h-8 shrink-0 items-center justify-end gap-1.5">
        {markdownPreview && (
          <PreviewToggle
            {...toggleProps}
            showPreview={showPreview}
            onToggle={toggle}
          />
        )}
        {actions}
      </div>
      {showPreview ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <MarkdownViewer content={content} />
        </div>
      ) : (
        renderEditor()
      )}
    </div>
  );
}
