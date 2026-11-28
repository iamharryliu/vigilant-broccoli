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
import { cn, SegmentedControl } from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from '@vigilant-broccoli/docs-explorer';

const PREVIEW_SHORTCUT_LABEL = 'Cmd+Shift+V';
const PREVIEW_TOGGLE_CODE = 'KeyV';
const MODE_CONTROL_LABEL = 'Markdown view';
const DEFAULT_PREVIEW_LABEL = 'Preview';
const DEFAULT_EDIT_LABEL = 'Edit';
const PREVIEW_MODE = { EDIT: 'edit', PREVIEW: 'preview' } as const;

type PreviewMode = (typeof PREVIEW_MODE)[keyof typeof PREVIEW_MODE];
const ICON_SIZE = 16;
const EDITABLE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
// The pane draws the card border, so the editor's own textarea border and
// radius are stripped; `!` beats SyncedTextEditor's inline border style.
const PANE_CLASS =
  'flex min-h-0 flex-col overflow-hidden rounded-md border border-border [&_textarea]:!rounded-none [&_textarea]:!border-0 [&_textarea]:!shadow-none';
// MarkdownViewer pads its prose wider than the textarea (12px, 24px from `sm`
// up), so the rendered text starts where the editor's text does.
const PREVIEW_CLASS =
  'min-h-0 flex-1 overflow-auto [&_.prose]:!px-3 [&_.prose]:!py-3';
const TOP_BAR_CLASS =
  'flex h-9 shrink-0 items-center justify-end gap-1.5 border-b border-border bg-muted px-1.5';

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

interface PreviewModeControlProps {
  showPreview: boolean;
  isLoading?: boolean;
  previewLabel?: string;
  editLabel?: string;
  onChange: (showPreview: boolean) => void;
}

const PreviewModeControl = ({
  showPreview,
  isLoading = false,
  previewLabel = DEFAULT_PREVIEW_LABEL,
  editLabel = DEFAULT_EDIT_LABEL,
  onChange,
}: PreviewModeControlProps) => (
  <SegmentedControl<PreviewMode>
    label={`${MODE_CONTROL_LABEL} (${PREVIEW_SHORTCUT_LABEL})`}
    size="sm"
    value={showPreview ? PREVIEW_MODE.PREVIEW : PREVIEW_MODE.EDIT}
    onChange={mode => onChange(mode === PREVIEW_MODE.PREVIEW)}
    className={isLoading ? 'pointer-events-none opacity-50' : undefined}
    options={[
      {
        value: PREVIEW_MODE.EDIT,
        label: editLabel,
        icon: <Pencil size={ICON_SIZE} />,
      },
      {
        value: PREVIEW_MODE.PREVIEW,
        label: previewLabel,
        icon: <Eye size={ICON_SIZE} />,
      },
    ]}
  />
);

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
    <div ref={paneRef} className={cn(PANE_CLASS, className)} style={style}>
      <div className={TOP_BAR_CLASS}>
        {markdownPreview && (
          <PreviewModeControl
            {...toggleProps}
            showPreview={showPreview}
            onChange={setIsPreview}
          />
        )}
        {actions}
      </div>
      {showPreview ? (
        <div className={PREVIEW_CLASS}>
          <MarkdownViewer content={content} />
        </div>
      ) : (
        renderEditor()
      )}
    </div>
  );
}
