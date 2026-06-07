import { useEffect, useMemo, useState } from 'react';
import {
  DocsExplorer,
  type DocsExplorerUrlSync,
  type DocsNode,
  type DocsSearchResult,
} from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from './markdown-viewer';
import { ChecklistViewer } from './checklist-viewer';

const FILE_PARAM = 'file';
const VIEW_MODE_STORAGE_KEY = 'docs-md:view-mode';

const VIEW_MODE = {
  MARKDOWN: 'markdown',
  CHECKLIST: 'checklist',
} as const;
type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

const MODE_LABEL: Record<ViewMode, string> = {
  [VIEW_MODE.MARKDOWN]: 'Markdown',
  [VIEW_MODE.CHECKLIST]: 'Checklist',
};

const CLS = {
  CENTERED_MSG: 'flex items-center justify-center h-full text-gray-500',
  CENTERED_ERR: 'flex items-center justify-center h-full text-red-500',
} as const;

const COPY = {
  LOADING_TREE: 'Loading file structure...',
  EMPTY: 'Select a markdown file to view its contents',
} as const;

export interface DocsViewerProps {
  getStructure: () => Promise<DocsNode[]>;
  getContent: (path: string) => Promise<string>;
  saveContent?: (path: string, content: string) => Promise<void>;
  search?: (query: string) => Promise<DocsSearchResult[]>;
  urlSync?: DocsExplorerUrlSync;
}

export function DocsViewer({
  getStructure,
  getContent,
  saveContent,
  search,
  urlSync,
}: DocsViewerProps) {
  const [nodes, setNodes] = useState<DocsNode[]>([]);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.MARKDOWN);
  const [activeFile, setActiveFile] = useState<string>(urlSync?.get() ?? '');
  const [editTrigger, setEditTrigger] = useState(0);

  useEffect(() => {
    getStructure()
      .then(setNodes)
      .catch(err => setTreeError(err.message))
      .finally(() => setIsLoadingTree(false));
  }, [getStructure]);

  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === VIEW_MODE.MARKDOWN || stored === VIEW_MODE.CHECKLIST) {
      setViewMode(stored);
    }
  }, []);

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  };

  const wrappedUrlSync = useMemo<DocsExplorerUrlSync | undefined>(
    () =>
      urlSync
        ? {
            get: urlSync.get,
            set: (path: string) => {
              urlSync.set(path);
              setActiveFile(path);
            },
          }
        : undefined,
    [urlSync],
  );

  const canEdit = Boolean(saveContent && activeFile);

  const viewModeOptions = (Object.values(VIEW_MODE) as ViewMode[]).map(mode => ({
    label: MODE_LABEL[mode],
    value: mode,
  }));

  const renderContent = (content: string) => (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        {viewMode === VIEW_MODE.CHECKLIST ? (
          <ChecklistViewer content={content} filePath={activeFile} />
        ) : (
          <MarkdownViewer
            content={content}
            filePath={activeFile}
            saveContent={saveContent}
            editTrigger={editTrigger}
          />
        )}
      </div>
    </div>
  );

  if (isLoadingTree) {
    return <div className={CLS.CENTERED_MSG}>{COPY.LOADING_TREE}</div>;
  }
  if (treeError) {
    return <div className={CLS.CENTERED_ERR}>{treeError}</div>;
  }

  return (
    <DocsExplorer
      nodes={nodes}
      getContent={getContent}
      renderContent={renderContent}
      search={search}
      urlSync={wrappedUrlSync}
      emptyMessage={COPY.EMPTY}
      onEdit={canEdit ? () => setEditTrigger(t => t + 1) : undefined}
      viewModes={viewModeOptions}
      onViewModeChange={updateViewMode}
      currentViewMode={viewMode}
    />
  );
}

export { FILE_PARAM };
