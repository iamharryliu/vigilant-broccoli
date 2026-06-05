import { useEffect, useState } from 'react';
import { marked } from 'marked';

const CLS = {
  ROOT: 'w-full h-full overflow-auto',
  PROSE: 'prose dark:prose-invert max-w-none px-4 sm:px-6 py-4',
  EDITOR_WRAP: 'flex flex-col h-full',
  TOOLBAR:
    'flex items-center justify-end gap-2 px-4 sm:px-6 py-2 border-b border-gray-200 dark:border-gray-700',
  BTN_BASE: 'px-3 py-1 text-xs rounded',
  BTN_PRIMARY:
    'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
  BTN_SECONDARY:
    'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
  TEXTAREA:
    'flex-1 min-h-0 w-full resize-none px-4 sm:px-6 py-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none',
  ERROR: 'text-xs text-red-500 mr-auto',
} as const;

const COPY = {
  EDIT: 'Edit',
  SAVE: 'Save',
  SAVING: 'Saving...',
  CANCEL: 'Cancel',
  SAVE_FAILED: 'Failed to save',
} as const;

interface MarkdownViewerProps {
  content: string;
  filePath?: string;
  saveContent?: (path: string, content: string) => Promise<void>;
}

export function MarkdownViewer({
  content,
  filePath,
  saveContent,
}: MarkdownViewerProps) {
  const [html, setHtml] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    marked.parse(content, { async: true }).then(setHtml);
  }, [content]);

  useEffect(() => {
    setIsEditing(false);
    setError(null);
    setDraft(content);
  }, [content, filePath]);

  const canEdit = Boolean(saveContent && filePath);

  const startEdit = () => {
    setDraft(content);
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
    setDraft(content);
  };

  const save = async () => {
    if (!saveContent || !filePath) return;
    setIsSaving(true);
    setError(null);
    try {
      await saveContent(filePath, draft);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : COPY.SAVE_FAILED);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className={CLS.EDITOR_WRAP}>
        <div className={CLS.TOOLBAR}>
          {error && <span className={CLS.ERROR}>{error}</span>}
          <button
            type="button"
            onClick={cancelEdit}
            className={`${CLS.BTN_BASE} ${CLS.BTN_SECONDARY}`}
            disabled={isSaving}
          >
            {COPY.CANCEL}
          </button>
          <button
            type="button"
            onClick={save}
            className={`${CLS.BTN_BASE} ${CLS.BTN_PRIMARY}`}
            disabled={isSaving}
          >
            {isSaving ? COPY.SAVING : COPY.SAVE}
          </button>
        </div>
        <textarea
          className={CLS.TEXTAREA}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div className={CLS.EDITOR_WRAP}>
      {canEdit && (
        <div className={CLS.TOOLBAR}>
          <button
            type="button"
            onClick={startEdit}
            className={`${CLS.BTN_BASE} ${CLS.BTN_SECONDARY}`}
          >
            {COPY.EDIT}
          </button>
        </div>
      )}
      <div className={CLS.ROOT}>
        <div className={CLS.PROSE} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
