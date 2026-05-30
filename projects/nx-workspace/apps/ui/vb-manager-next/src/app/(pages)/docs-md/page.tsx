'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DocsExplorer,
  DocsExplorerUrlSync,
  DocsNode,
  DocsSearchResult,
} from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from '../../components/docs/markdown-viewer.component';
import { ChecklistViewer } from '../../components/docs/checklist-viewer.component';

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

const COPY = {
  LOADING_TREE: 'Loading file structure...',
  LOADING: 'Loading...',
  EMPTY: 'Select a markdown file to view its contents',
} as const;

const TOOLBAR_CLS =
  'flex items-center gap-1 px-6 pt-3 pb-2 border-b border-gray-200 dark:border-gray-700';
const MODE_BTN_BASE = 'px-3 py-1 text-xs rounded';
const MODE_BTN_ACTIVE =
  'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
const MODE_BTN_INACTIVE =
  'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300';
const CENTERED_MSG_CLS = 'flex items-center justify-center h-full text-gray-500';
const CENTERED_ERR_CLS = 'flex items-center justify-center h-full text-red-500';

const fetchStructure = async (): Promise<DocsNode[]> => {
  const response = await fetch('/api/docs/structure');
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to load structure');
  return data.data as DocsNode[];
};

const fetchContent = async (path: string): Promise<string> => {
  const response = await fetch(
    `/api/docs/content?path=${encodeURIComponent(path)}`,
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to load content');
  return data.content as string;
};

const searchDocs = async (query: string): Promise<DocsSearchResult[]> => {
  const response = await fetch(
    `/api/docs/search?q=${encodeURIComponent(query)}`,
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to search');
  return data.results as DocsSearchResult[];
};

interface ModeButtonProps {
  mode: ViewMode;
  active: ViewMode;
  onSelect: (mode: ViewMode) => void;
}

const ModeButton = ({ mode, active, onSelect }: ModeButtonProps) => (
  <button
    type="button"
    onClick={() => onSelect(mode)}
    className={`${MODE_BTN_BASE} ${active === mode ? MODE_BTN_ACTIVE : MODE_BTN_INACTIVE}`}
  >
    {MODE_LABEL[mode]}
  </button>
);

function DocsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [nodes, setNodes] = useState<DocsNode[]>([]);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.MARKDOWN);

  useEffect(() => {
    fetchStructure()
      .then(setNodes)
      .catch(err => setTreeError(err.message))
      .finally(() => setIsLoadingTree(false));
  }, []);

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

  const activeFile = searchParams.get(FILE_PARAM) ?? '';

  const renderContent = (content: string) => (
    <div className="flex flex-col h-full">
      <div className={TOOLBAR_CLS}>
        <ModeButton
          mode={VIEW_MODE.MARKDOWN}
          active={viewMode}
          onSelect={updateViewMode}
        />
        <ModeButton
          mode={VIEW_MODE.CHECKLIST}
          active={viewMode}
          onSelect={updateViewMode}
        />
      </div>
      <div className="flex-1 min-h-0">
        {viewMode === VIEW_MODE.CHECKLIST ? (
          <ChecklistViewer content={content} filePath={activeFile} />
        ) : (
          <MarkdownViewer content={content} />
        )}
      </div>
    </div>
  );

  const urlSync = useMemo<DocsExplorerUrlSync>(
    () => ({
      get: () => searchParams.get(FILE_PARAM),
      set: path => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(FILE_PARAM, path);
        router.push(`?${params.toString()}`, { scroll: false });
      },
    }),
    [searchParams, router],
  );

  if (isLoadingTree) {
    return <div className={CENTERED_MSG_CLS}>{COPY.LOADING_TREE}</div>;
  }
  if (treeError) {
    return <div className={CENTERED_ERR_CLS}>{treeError}</div>;
  }

  return (
    <DocsExplorer
      nodes={nodes}
      getContent={fetchContent}
      renderContent={renderContent}
      search={searchDocs}
      urlSync={urlSync}
      emptyMessage={COPY.EMPTY}
    />
  );
}

export default function DocsPage() {
  return (
    <Suspense
      fallback={<div className={CENTERED_MSG_CLS}>{COPY.LOADING}</div>}
    >
      <DocsPageContent />
    </Suspense>
  );
}
