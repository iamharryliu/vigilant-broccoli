import { useEffect, useMemo, useState } from 'react';
import { SegmentedControl } from '@radix-ui/themes';
import {
  Button,
  DocsExplorer,
  type DocsExplorerUrlSync,
  type DocsNode,
  type DocsSearchResult,
  type NoteGraph,
} from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from './markdown-viewer';
import { ChecklistViewer } from './checklist-viewer';
import {
  GraphView,
  localSubgraph,
  DEFAULT_FORCES,
  FORCE_LIMITS,
  type GraphForces,
} from './graph-view';

const FILE_PARAM = 'file';
const VIEW_MODE_STORAGE_KEY = 'docs-md:view-mode';
const GRAPH_SCOPE_STORAGE_KEY = 'docs-md:graph-scope';
const GRAPH_DEPTH_STORAGE_KEY = 'docs-md:graph-depth';

const VIEW_MODE = {
  MARKDOWN: 'markdown',
  CHECKLIST: 'checklist',
} as const;
type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

const MODE_LABEL: Record<ViewMode, string> = {
  [VIEW_MODE.MARKDOWN]: 'Markdown',
  [VIEW_MODE.CHECKLIST]: 'Checklist',
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

const DEFAULT_GRAPH_DEPTH = 1;
const GRAPH_DEPTH_OPTIONS = [1, 2] as const;

const GRAPH_FORCE_STORAGE_PREFIX = 'docs-md:graph-force-';
const FORCE_ORDER: (keyof GraphForces)[] = [
  'center',
  'repel',
  'link',
  'linkDistance',
];
const FORCE_LABEL: Record<keyof GraphForces, string> = {
  center: 'Center force',
  repel: 'Repel force',
  link: 'Link force',
  linkDistance: 'Link distance',
};
const forceStorageKey = (key: keyof GraphForces) =>
  `${GRAPH_FORCE_STORAGE_PREFIX}${key}`;

const CLS = {
  CENTERED_MSG: 'flex items-center justify-center h-full text-gray-500',
  CENTERED_ERR: 'flex items-center justify-center h-full text-red-500',
} as const;

const COPY = {
  LOADING_TREE: 'Loading file structure...',
  EMPTY: 'Select a markdown file to view its contents',
  LOADING_GRAPH: 'Loading graph...',
  GRAPH_ERROR: 'Failed to load graph',
  ORPHAN_NOTE: 'This note has no links',
  FORCES: 'Forces',
  RESET: 'Reset',
} as const;

const depthLabel = (value: number) => `${value} hop${value > 1 ? 's' : ''}`;

const AGGREGATE_KEY_PREFIX = 'aggregate:';

export interface DocsViewerProps {
  getStructure: () => Promise<DocsNode[]>;
  getContent: (path: string) => Promise<string>;
  saveContent?: (path: string, content: string) => Promise<void>;
  search?: (query: string) => Promise<DocsSearchResult[]>;
  getGraph?: () => Promise<NoteGraph>;
  urlSync?: DocsExplorerUrlSync;
}

function GraphPanel({
  getGraph,
  activePath,
  onSelect,
}: {
  getGraph: () => Promise<NoteGraph>;
  activePath?: string;
  onSelect: (path: string) => void;
}) {
  const [graph, setGraph] = useState<NoteGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<GraphScope>(GRAPH_SCOPE.LOCAL);
  const [depth, setDepth] = useState<number>(DEFAULT_GRAPH_DEPTH);
  const [forces, setForces] = useState<GraphForces>(DEFAULT_FORCES);
  const [showForces, setShowForces] = useState(false);

  useEffect(() => {
    const storedScope = window.localStorage.getItem(GRAPH_SCOPE_STORAGE_KEY);
    if (
      storedScope === GRAPH_SCOPE.GLOBAL ||
      storedScope === GRAPH_SCOPE.LOCAL
    ) {
      setScope(storedScope);
    }
    const storedDepth = Number(
      window.localStorage.getItem(GRAPH_DEPTH_STORAGE_KEY),
    );
    if ((GRAPH_DEPTH_OPTIONS as readonly number[]).includes(storedDepth)) {
      setDepth(storedDepth);
    }
    setForces(prev => {
      const next = { ...prev };
      for (const key of FORCE_ORDER) {
        const raw = window.localStorage.getItem(forceStorageKey(key));
        if (raw === null) continue;
        const value = Number(raw);
        const lim = FORCE_LIMITS[key];
        if (Number.isFinite(value) && value >= lim.min && value <= lim.max) {
          next[key] = value;
        }
      }
      return next;
    });
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

  const updateScope = (next: GraphScope) => {
    setScope(next);
    window.localStorage.setItem(GRAPH_SCOPE_STORAGE_KEY, next);
  };

  const updateDepth = (next: number) => {
    setDepth(next);
    window.localStorage.setItem(GRAPH_DEPTH_STORAGE_KEY, String(next));
  };

  const updateForce = (key: keyof GraphForces, value: number) => {
    setForces(prev => ({ ...prev, [key]: value }));
    window.localStorage.setItem(forceStorageKey(key), String(value));
  };

  const resetForces = () => {
    setForces(DEFAULT_FORCES);
    for (const key of FORCE_ORDER)
      window.localStorage.removeItem(forceStorageKey(key));
  };

  const isLocal = scope === GRAPH_SCOPE.LOCAL && Boolean(activePath);

  const displayGraph = useMemo(() => {
    if (!graph) return graph;
    if (isLocal && activePath) return localSubgraph(graph, activePath, depth);
    return graph;
  }, [graph, isLocal, activePath, depth]);

  if (error) return <div className={CLS.CENTERED_ERR}>{error}</div>;
  if (!graph)
    return <div className={CLS.CENTERED_MSG}>{COPY.LOADING_GRAPH}</div>;

  const isOrphan = isLocal && (displayGraph?.nodes.length ?? 0) <= 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center flex-wrap gap-2 px-12 pt-2 pb-1 flex-shrink-0">
        <SegmentedControl.Root
          size="1"
          value={scope}
          onValueChange={value => updateScope(value as GraphScope)}
        >
          {(Object.values(GRAPH_SCOPE) as GraphScope[]).map(value => (
            <SegmentedControl.Item key={value} value={value}>
              {GRAPH_SCOPE_LABEL[value]}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
        {scope === GRAPH_SCOPE.LOCAL && (
          <SegmentedControl.Root
            size="1"
            value={String(depth)}
            onValueChange={value => updateDepth(Number(value))}
          >
            {GRAPH_DEPTH_OPTIONS.map(value => (
              <SegmentedControl.Item key={value} value={String(value)}>
                {depthLabel(value)}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        )}
        <Button
          size="sm"
          variant={showForces ? 'default' : 'secondary'}
          onClick={() => setShowForces(prev => !prev)}
        >
          {COPY.FORCES}
        </Button>
      </div>
      <div className="relative flex-1 min-h-0">
        {showForces && (
          <div className="absolute top-2 right-2 z-10 flex w-56 flex-col gap-3 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
            {FORCE_ORDER.map(key => {
              const lim = FORCE_LIMITS[key];
              return (
                <label key={key} className="flex flex-col gap-1">
                  <span className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>{FORCE_LABEL[key]}</span>
                    <span className="tabular-nums text-gray-400">
                      {forces[key]}
                    </span>
                  </span>
                  <input
                    type="range"
                    className="h-1.5 w-full cursor-pointer accent-blue-500"
                    min={lim.min}
                    max={lim.max}
                    step={lim.step}
                    value={forces[key]}
                    onChange={e => updateForce(key, e.target.valueAsNumber)}
                  />
                </label>
              );
            })}
            <button
              type="button"
              onClick={resetForces}
              className="self-end text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {COPY.RESET}
            </button>
          </div>
        )}
        {displayGraph && (
          <GraphView
            graph={displayGraph}
            activePath={activePath}
            onSelect={onSelect}
            forces={forces}
          />
        )}
        {isOrphan && (
          <div className="absolute bottom-2 inset-x-0 text-center text-xs text-gray-500 pointer-events-none">
            {COPY.ORPHAN_NOTE}
          </div>
        )}
      </div>
    </div>
  );
}

export function DocsViewer({
  getStructure,
  getContent,
  saveContent,
  search,
  getGraph,
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

  const viewModeOptions = (Object.values(VIEW_MODE) as ViewMode[]).map(
    mode => ({
      label: MODE_LABEL[mode],
      value: mode,
    }),
  );

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
      onViewModeChange={mode => updateViewMode(mode as ViewMode)}
      currentViewMode={viewMode}
      renderGraph={
        getGraph
          ? navigate => (
              <GraphPanel
                getGraph={getGraph}
                activePath={activeFile}
                onSelect={navigate}
              />
            )
          : undefined
      }
    />
  );
}

export { FILE_PARAM };
