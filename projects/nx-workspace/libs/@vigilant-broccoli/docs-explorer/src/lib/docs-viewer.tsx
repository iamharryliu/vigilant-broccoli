import { FileText, ListChecks } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Select,
  useDocumentTitle,
  SegmentedControl,
} from '@vigilant-broccoli/react-lib';
import {
  DocsExplorer,
  MENU_ICON_SIZE,
  type DocsExplorerUrlSync,
  type DocsNode,
  type DocsSearchResult,
  type NoteGraph,
} from './DocsExplorer';
import { MarkdownViewer } from './markdown-viewer';
import { ChecklistViewer } from './checklist-viewer';
import {
  GraphView,
  localSubgraph,
  type GraphZoomControlLabels,
} from './graph-view';
import {
  GraphSettingsFields,
  GraphSettingsMenu,
  useGraphSettings,
} from './graph-settings';

const FILE_PARAM = 'file';

// Keeps the open file in a query param. set() must carry the hash over:
// DocsExplorer echoes the initial file back through set() on mount, and
// rebuilding from the params alone would drop a `#section` from a direct link.
export const createSearchParamUrlSync = (
  param = FILE_PARAM,
): DocsExplorerUrlSync => ({
  get: () => new URLSearchParams(window.location.search).get(param),
  set: (path, { replace = false } = {}) => {
    const params = new URLSearchParams(window.location.search);
    params.set(param, path);
    const url = `?${params.toString()}${window.location.hash}`;
    if (replace) window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
  },
  clear: () => {
    const params = new URLSearchParams(window.location.search);
    params.delete(param);
    const query = params.toString();
    window.history.pushState(
      null,
      '',
      query ? `?${query}` : window.location.pathname,
    );
  },
  subscribe: onChange => {
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  },
});

const VIEW_MODE_STORAGE_KEY = 'docs-md:view-mode';
const GRAPH_SCOPE_STORAGE_KEY = 'docs-md:graph-scope';
const GRAPH_DEPTH_STORAGE_KEY = 'docs-md:graph-depth';
// Keeps the keys the notes graph saved under before the settings were shared.
const GRAPH_SETTINGS_STORAGE_PREFIX = 'docs-md';
const GRAPH_ZOOM_LABELS: GraphZoomControlLabels = {
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  reset: 'Reset view',
};

const VIEW_MODE = {
  MARKDOWN: 'markdown',
  CHECKLIST: 'checklist',
} as const;
type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

const MODE_LABEL: Record<ViewMode, string> = {
  [VIEW_MODE.MARKDOWN]: 'Markdown',
  [VIEW_MODE.CHECKLIST]: 'Checklist',
};

const MODE_ICON: Record<ViewMode, typeof FileText> = {
  [VIEW_MODE.MARKDOWN]: FileText,
  [VIEW_MODE.CHECKLIST]: ListChecks,
};

const GRAPH_SCOPE = {
  GLOBAL: 'global',
  LOCAL: 'local',
} as const;
type GraphScope = (typeof GRAPH_SCOPE)[keyof typeof GRAPH_SCOPE];

const GRAPH_SCOPE_LABEL: Record<GraphScope, string> = {
  [GRAPH_SCOPE.GLOBAL]: 'Global',
  [GRAPH_SCOPE.LOCAL]: 'Local',
};

const DEFAULT_GRAPH_DEPTH = 4;
const MAX_GRAPH_DEPTH = 10;
const GRAPH_DEPTH_OPTIONS = Array.from(
  { length: MAX_GRAPH_DEPTH },
  (_, index) => index + 1,
);

const CLS = {
  CENTERED_MSG: 'flex items-center justify-center h-full text-gray-500',
  CENTERED_ERR: 'flex items-center justify-center h-full text-red-500',
} as const;

const COPY = {
  EMPTY: 'Select a markdown file to view its contents',
  GRAPH_ERROR: 'Failed to load graph',
  ORPHAN_NOTE: 'This note has no links',
  SCOPE_LABEL: 'Graph scope',
  DEPTH_LABEL: 'Graph depth',
  DEPTH_PLACEHOLDER: 'Hops',
} as const;

const depthLabel = (value: number) => `${value} hop${value > 1 ? 's' : ''}`;

const AGGREGATE_KEY_PREFIX = 'aggregate:';
const HEADING_RE = /^#\s+(.+)$/m;

const titleFromPath = (path: string) =>
  path.split('/').pop()?.replace(/\.md$/i, '') ?? path;

function DocumentTitleSync({
  content,
  fallback,
  siteName,
}: {
  content: string;
  fallback: string;
  siteName?: string;
}) {
  const title = HEADING_RE.exec(content)?.[1]?.trim() || fallback;
  useDocumentTitle(siteName ? `${title} | ${siteName}` : title);
  return null;
}

export interface DocsViewerProps {
  siteName?: string;
  getStructure: () => Promise<DocsNode[]>;
  getContent: (path: string) => Promise<string>;
  saveContent?: (path: string, content: string) => Promise<void>;
  search?: (query: string) => Promise<DocsSearchResult[]>;
  getGraph?: () => Promise<NoteGraph>;
  urlSync?: DocsExplorerUrlSync;
  enableMultiSelect?: boolean;
  getShareUrl?: (path: string) => string | null;
}

const persistGraphScope = (scope: GraphScope) =>
  window.localStorage.setItem(GRAPH_SCOPE_STORAGE_KEY, scope);

function GraphPanel({
  getGraph,
  activePath,
  onSelect,
  scope,
  onScopeChange: updateScope,
}: {
  getGraph: () => Promise<NoteGraph>;
  activePath?: string;
  onSelect: (path: string) => void;
  scope: GraphScope;
  onScopeChange: (scope: GraphScope) => void;
}) {
  const [graph, setGraph] = useState<NoteGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [depth, setDepth] = useState<number>(DEFAULT_GRAPH_DEPTH);
  const settings = useGraphSettings(GRAPH_SETTINGS_STORAGE_PREFIX);

  useEffect(() => {
    const storedDepth = Number(
      window.localStorage.getItem(GRAPH_DEPTH_STORAGE_KEY),
    );
    if (GRAPH_DEPTH_OPTIONS.includes(storedDepth)) {
      setDepth(storedDepth);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getGraph()
      .then(g => !cancelled && setGraph(g))
      .catch(() => !cancelled && setError(COPY.GRAPH_ERROR));
    return () => {
      cancelled = true;
    };
  }, [getGraph]);

  const updateDepth = (next: number) => {
    setDepth(next);
    window.localStorage.setItem(GRAPH_DEPTH_STORAGE_KEY, String(next));
  };

  const isLocal = scope === GRAPH_SCOPE.LOCAL && Boolean(activePath);

  const displayGraph = useMemo(() => {
    if (!graph) return graph;
    if (isLocal && activePath) return localSubgraph(graph, activePath, depth);
    return graph;
  }, [graph, isLocal, activePath, depth]);

  if (error) return <div className={CLS.CENTERED_ERR}>{error}</div>;
  if (!graph) return null;

  const isOrphan = isLocal && (displayGraph?.nodes.length ?? 0) <= 1;

  const settingsBody = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          label={COPY.SCOPE_LABEL}
          size="sm"
          value={scope}
          onChange={updateScope}
          options={(Object.values(GRAPH_SCOPE) as GraphScope[]).map(value => ({
            value,
            label: GRAPH_SCOPE_LABEL[value],
          }))}
        />
        {scope === GRAPH_SCOPE.LOCAL && (
          <Select
            aria-label={COPY.DEPTH_LABEL}
            placeholder={COPY.DEPTH_PLACEHOLDER}
            className="h-7 text-xs"
            value={depth}
            onValueChange={updateDepth}
            options={GRAPH_DEPTH_OPTIONS}
            renderItem={depthLabel}
          />
        )}
      </div>
      <GraphSettingsFields settings={settings} />
    </>
  );

  return (
    <div className="flex flex-col h-full">
      {/* The graph area already sits inside the card padding, so the content
          bar's py-1 px-2 alone lines this up with its right-hand buttons. */}
      <div className="absolute top-1 right-2 z-10">
        <GraphSettingsMenu>{settingsBody}</GraphSettingsMenu>
      </div>
      <div className="relative flex-1 min-h-0">
        {displayGraph && (
          <GraphView
            graph={displayGraph}
            activePath={activePath}
            onSelect={onSelect}
            forces={settings.appliedForces}
            palette={settings.colorScheme.colors ?? undefined}
            showNodeGlow={settings.showNodeGlow}
            zoomControls={GRAPH_ZOOM_LABELS}
          />
        )}
        {isOrphan && (
          <div className="absolute bottom-2 inset-x-0 text-center text-xs text-muted-foreground pointer-events-none">
            {COPY.ORPHAN_NOTE}
          </div>
        )}
      </div>
    </div>
  );
}

export function DocsViewer({
  siteName,
  getStructure,
  getContent,
  saveContent,
  search,
  getGraph,
  urlSync,
  enableMultiSelect,
  getShareUrl,
}: DocsViewerProps) {
  const [nodes, setNodes] = useState<DocsNode[]>([]);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.MARKDOWN);
  const [activeFile, setActiveFile] = useState<string>(urlSync?.get() ?? '');
  const [editTrigger, setEditTrigger] = useState(0);
  const [graphScope, setGraphScope] = useState<GraphScope>(GRAPH_SCOPE.LOCAL);

  useEffect(() => {
    const stored = window.localStorage.getItem(GRAPH_SCOPE_STORAGE_KEY);
    if (stored === GRAPH_SCOPE.GLOBAL || stored === GRAPH_SCOPE.LOCAL) {
      setGraphScope(stored);
    }
  }, []);

  const updateGraphScope = (scope: GraphScope) => {
    setGraphScope(scope);
    persistGraphScope(scope);
  };

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
            set: (path, options) => {
              urlSync.set(path, options);
              setActiveFile(path);
              // Opening a file centres the next graph view on it.
              setGraphScope(GRAPH_SCOPE.LOCAL);
              persistGraphScope(GRAPH_SCOPE.LOCAL);
            },
            clear: () => {
              urlSync.clear?.();
              setActiveFile('');
            },
            subscribe: urlSync.subscribe
              ? onChange =>
                  urlSync.subscribe?.(() => {
                    const path = urlSync.get() ?? '';
                    setActiveFile(path);
                    if (path) {
                      setGraphScope(GRAPH_SCOPE.LOCAL);
                      persistGraphScope(GRAPH_SCOPE.LOCAL);
                    }
                    onChange();
                  }) ?? (() => undefined)
              : undefined,
          }
        : undefined,
    [urlSync],
  );

  const canEdit = Boolean(saveContent && activeFile);

  const viewModeOptions = (Object.values(VIEW_MODE) as ViewMode[]).map(mode => {
    const Icon = MODE_ICON[mode];
    return {
      label: MODE_LABEL[mode],
      value: mode,
      icon: <Icon size={MENU_ICON_SIZE} />,
    };
  });

  const renderContent = (
    content: string,
    navigate: (path: string) => void,
    sourcePaths: string[],
  ) => {
    const isAggregate = sourcePaths.length > 1;
    const contentKey = isAggregate
      ? `${AGGREGATE_KEY_PREFIX}${sourcePaths.join('|')}`
      : (sourcePaths[0] ?? activeFile);

    return (
      <div className="flex flex-col h-full">
        <DocumentTitleSync
          siteName={siteName}
          content={content}
          fallback={isAggregate ? contentKey : titleFromPath(contentKey)}
        />
        <div className="flex-1 min-h-0">
          {viewMode === VIEW_MODE.CHECKLIST ? (
            <ChecklistViewer
              content={content}
              filePath={contentKey}
              onNavigate={navigate}
            />
          ) : (
            <MarkdownViewer
              content={content}
              filePath={sourcePaths[0] ?? activeFile}
              saveContent={isAggregate ? undefined : saveContent}
              editTrigger={editTrigger}
              onNavigate={navigate}
            />
          )}
        </div>
      </div>
    );
  };

  if (isLoadingTree) return null;
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
      enableMultiSelect={enableMultiSelect}
      getShareUrl={getShareUrl}
      emptyMessage={COPY.EMPTY}
      onEdit={canEdit ? () => setEditTrigger(t => t + 1) : undefined}
      viewModes={viewModeOptions}
      onViewModeChange={mode => updateViewMode(mode as ViewMode)}
      currentViewMode={viewMode}
      renderGraph={
        getGraph
          ? navigate => (
              <GraphPanel
                getGraph={getGraph}
                activePath={activeFile}
                onSelect={navigate}
                scope={graphScope}
                onScopeChange={updateGraphScope}
              />
            )
          : undefined
      }
    />
  );
}

export { FILE_PARAM };
