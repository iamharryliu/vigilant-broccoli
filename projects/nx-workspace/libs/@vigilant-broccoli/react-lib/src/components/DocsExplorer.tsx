'use client';

import { Card, DropdownMenu } from '@radix-ui/themes';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { InputGroup, InputGroupAddon, InputGroupInput } from './Input';
import {
  ChevronDown,
  ChevronRight,
  File,
  FileText,
  Folder,
  Search as SearchIcon,
} from 'lucide-react';
import {
  Fragment,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HighlightMatch } from './HighlightMatch';

const MOBILE_NO_CARD_CLS =
  '!p-0 [&::before]:!hidden [&::after]:!hidden md:!p-3 md:[&::before]:![display:revert] md:[&::after]:![display:revert]';

const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_UP = 'ArrowUp';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_RESULT_ITEM_ATTR = 'data-search-result-index';
const NODE_TYPE_DIRECTORY = 'directory';
const MATCH_TYPE_FILENAME = 'filename';
const INDENT_PX = 16;
const INDENT_BASE_PX = 8;
const LEADING_HEADING_RE = /^#\s[^\n]*\n+/;
const ALL_HEADINGS_RE = /^#{1,6}\s[^\n]*\n+/gm;
const AGGREGATE_SEPARATOR = '\n\n---\n\n';
const HASH_SEP = '#';

const stripLeadingHeading = (content: string) =>
  content.replace(LEADING_HEADING_RE, '');

const stripAllHeadings = (content: string) =>
  content.replace(ALL_HEADINGS_RE, '');

const AGGREGATE_MODE = {
  NONE: 'none',
  COLLAPSED: 'collapsed',
  FLAT: 'flat',
} as const;
type AggregateMode = (typeof AGGREGATE_MODE)[keyof typeof AGGREGATE_MODE];

const AGGREGATE_TRANSFORM: Record<AggregateMode, (content: string) => string> =
  {
    [AGGREGATE_MODE.NONE]: content => content,
    [AGGREGATE_MODE.COLLAPSED]: stripLeadingHeading,
    [AGGREGATE_MODE.FLAT]: stripAllHeadings,
  };

const buildAggregateContent = (contents: string[], mode: AggregateMode) =>
  contents.map(AGGREGATE_TRANSFORM[mode]).join(AGGREGATE_SEPARATOR);

export interface DocsNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: DocsNode[];
}

export interface DocsSearchResult {
  name: string;
  path: string;
  matchType: 'filename' | 'content';
  score: number;
  excerpt?: string;
}

export interface NoteGraphNode {
  id: string;
  name: string;
  group: string;
}

export interface NoteGraphLink {
  source: string;
  target: string;
}

export interface NoteGraph {
  nodes: NoteGraphNode[];
  links: NoteGraphLink[];
}

export interface DocsExplorerUrlSync {
  get: () => string | null;
  set: (path: string) => void;
}

export interface ViewModeOption {
  label: string;
  value: string;
}

export interface DocsExplorerAction {
  label: string;
  onSelect: () => void;
}

interface DocsExplorerProps {
  nodes: DocsNode[];
  getContent: (path: string) => Promise<string>;
  renderContent?: (
    content: string,
    navigate: (path: string) => void,
    sourcePaths: string[],
  ) => ReactNode;
  search?: (query: string) => Promise<DocsSearchResult[]>;
  urlSync?: DocsExplorerUrlSync;
  sidebarTitle?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onEdit?: () => void;
  onCreate?: () => void;
  extraActions?: (path: string) => DocsExplorerAction[];
  viewModes?: ViewModeOption[];
  onViewModeChange?: (mode: string | undefined) => void;
  currentViewMode?: string;
  renderGraph?: (navigate: (path: string) => void) => ReactNode;
}

const COPY = {
  SIDEBAR_TITLE: 'Notes',
  SEARCH_PLACEHOLDER: 'Search files...',
  EMPTY_MESSAGE: 'Select a file to view its contents',
  SEARCHING: 'Searching...',
  NO_RESULTS: 'No results found',
  LOADING_CONTENT: 'Loading file content...',
  LOAD_CONTENT_ERROR: 'Failed to load file content',
  COPY_MARKDOWN: 'Copy markdown',
  EDIT: 'Edit',
  DOCUMENT_ACTIONS: 'Document actions',
  BACK_TO_FILES: 'Back to files',
  SELECTED_SUFFIX: 'selected',
  CLEAR_SELECTION: 'Clear',
  LOADING_AGGREGATE: 'Loading selected files...',
  SIDEBAR_ACTIONS: 'Sidebar actions',
  CREATE_FILE: 'Create file',
  SELECT_MULTIPLE: 'Select multiple',
  TURN_OFF_MULTI_SELECT: 'Turn off multi-select',
  SHOW_GRAPH: 'Graph view',
  HIDE_GRAPH: 'Close graph view',
  GRAPH_TITLE: 'Graph',
} as const;

const AGGREGATE_MODE_LABEL: Record<AggregateMode, string> = {
  [AGGREGATE_MODE.NONE]: 'Normal',
  [AGGREGATE_MODE.COLLAPSED]: 'View as collapsed note',
  [AGGREGATE_MODE.FLAT]: 'Collapse to list',
};

export const DocsExplorer = ({
  nodes,
  getContent,
  renderContent,
  search,
  urlSync,
  sidebarTitle = COPY.SIDEBAR_TITLE,
  searchPlaceholder = COPY.SEARCH_PLACEHOLDER,
  emptyMessage = COPY.EMPTY_MESSAGE,
  onEdit,
  onCreate,
  extraActions,
  viewModes,
  onViewModeChange,
  currentViewMode,
  renderGraph,
}: DocsExplorerProps) => {
  const [showGraph, setShowGraph] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [aggregateSourceContents, setAggregateSourceContents] = useState<
    string[]
  >([]);
  const [isLoadingAggregate, setIsLoadingAggregate] = useState(false);
  const [aggregateError, setAggregateError] = useState<string | null>(null);
  const [aggregateMode, setAggregateMode] = useState<AggregateMode>(
    AGGREGATE_MODE.NONE,
  );
  const hasSelection = selectedPaths.length > 0;
  const isAggregate = selectedPaths.length > 1;
  const aggregateContent = buildAggregateContent(
    aggregateSourceContents,
    aggregateMode,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocsSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [mobilePanel, setMobilePanel] = useState<'sidebar' | 'content'>(
    'sidebar',
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const toggleSelectPath = useCallback((path: string) => {
    setSelectedPaths(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path],
    );
  }, []);

  const clearSelection = () => setSelectedPaths([]);

  const toggleMultiSelectMode = () => {
    if (multiSelectMode) clearSelection();
    setMultiSelectMode(prev => !prev);
  };

  useEffect(() => {
    if (!hasSelection) return;
    let cancelled = false;
    setIsLoadingAggregate(true);
    setAggregateError(null);
    Promise.all(selectedPaths.map(getContent))
      .then(contents => {
        if (cancelled) return;
        setAggregateSourceContents(contents);
      })
      .catch(err => {
        if (cancelled) return;
        setAggregateError(
          err instanceof Error ? err.message : COPY.LOAD_CONTENT_ERROR,
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAggregate(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPaths, hasSelection, getContent]);

  const selectFile = useCallback(
    async (pathWithHash: string) => {
      setShowGraph(false);
      const [path, hash] = pathWithHash.split(HASH_SEP);
      // Only touch the hash when the caller supplied one (a resolved cross-file
      // link) — plain path selections (tree, search, initial URL sync) leave
      // whatever's already in the URL alone, so a direct load of `?file=...#foo`
      // isn't clobbered by the initial mount echoing the file back into the URL.
      if (hash !== undefined) window.location.hash = hash;
      setSelectedPaths([]);
      setSelectedPath(path);
      setMobilePanel('content');
      urlSync?.set(path);
      setIsLoadingContent(true);
      setContentError(null);
      try {
        const next = await getContent(path);
        setContent(next);
      } catch (err) {
        setContentError(
          err instanceof Error ? err.message : COPY.LOAD_CONTENT_ERROR,
        );
        setContent('');
      } finally {
        setIsLoadingContent(false);
      }
    },
    [getContent, urlSync],
  );

  useEffect(() => {
    const initial = urlSync?.get();
    if (initial && !selectedPath) {
      selectFile(initial);
      setMobilePanel('content');
    }
  }, [urlSync, selectedPath, selectFile]);

  const showSidebarOnMobile = () => setMobilePanel('sidebar');

  useEffect(() => {
    if (!search) return;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await search(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, search]);

  const isSearchMode = searchQuery.trim().length > 0;

  const focusResultAt = useCallback((index: number) => {
    const root = resultsContainerRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>(
      `[${SEARCH_RESULT_ITEM_ATTR}]`,
    );
    if (items.length === 0) return;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    items[clamped]?.focus();
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleSearchInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === KEY_ARROW_DOWN) {
      event.preventDefault();
      focusResultAt(0);
      return;
    }
    if (event.key === KEY_ENTER) {
      if (isSearching || searchResults.length === 0) return;
      event.preventDefault();
      selectFile(searchResults[0].path);
      return;
    }
    if (event.key === KEY_ESCAPE && searchQuery) {
      event.preventDefault();
      clearSearch();
    }
  };

  const handleResultsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === KEY_ESCAPE) {
      event.preventDefault();
      clearSearch();
      return;
    }
    if (event.key !== KEY_ARROW_DOWN && event.key !== KEY_ARROW_UP) return;
    const target = event.target as HTMLElement;
    const indexAttr = target.getAttribute(SEARCH_RESULT_ITEM_ATTR);
    if (indexAttr === null) return;
    event.preventDefault();
    const currentIndex = Number(indexAttr);
    if (event.key === KEY_ARROW_DOWN) {
      focusResultAt(currentIndex + 1);
    } else if (currentIndex === 0) {
      searchInputRef.current?.focus();
    } else {
      focusResultAt(currentIndex - 1);
    }
  };

  const sidebarVisibilityCls =
    mobilePanel === 'sidebar' ? 'flex' : '!hidden md:!flex';
  const contentVisibilityCls =
    mobilePanel === 'content' ? 'flex' : '!hidden md:!flex';

  return (
    <div className="h-full flex gap-2 md:gap-4">
      <Card
        className={`${MOBILE_NO_CARD_CLS} ${sidebarVisibilityCls} w-full md:w-80 md:flex-shrink-0 overflow-hidden flex-col`}
      >
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-sm font-semibold">{sidebarTitle}</h2>
            <div className="flex items-center gap-1">
              {renderGraph && (
                <IconButton
                  variant={showGraph ? 'default' : 'ghost'}
                  icon="graph"
                  aria-label={showGraph ? COPY.HIDE_GRAPH : COPY.SHOW_GRAPH}
                  onClick={() => {
                    setShowGraph(prev => !prev);
                    setMobilePanel('content');
                  }}
                />
              )}
              {onCreate && (
                <IconButton
                  variant="ghost"
                  icon="plus"
                  aria-label={COPY.CREATE_FILE}
                  onClick={onCreate}
                />
              )}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton
                    variant="ghost"
                    icon="ellipsis-horizontal"
                    aria-label={COPY.SIDEBAR_ACTIONS}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onSelect={toggleMultiSelectMode}>
                    {multiSelectMode
                      ? COPY.TURN_OFF_MULTI_SELECT
                      : COPY.SELECT_MULTIPLE}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
          {search && (
            <>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <SearchIcon className="w-4 h-4" />
                </InputGroupAddon>
                <InputGroupInput
                  ref={searchInputRef}
                  hasStartAddon
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                />
              </InputGroup>
              {isSearchMode && !isSearching && (
                <div className="text-xs text-gray-500 mt-1.5">
                  {searchResults.length === 0
                    ? COPY.NO_RESULTS
                    : `${searchResults.length} ${
                        searchResults.length === 1 ? 'result' : 'results'
                      }`}
                </div>
              )}
            </>
          )}
          {hasSelection && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1.5">
              <span>
                {selectedPaths.length} {COPY.SELECTED_SUFFIX}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {COPY.CLEAR_SELECTION}
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {isSearchMode ? (
            <div
              ref={resultsContainerRef}
              className="px-1 pb-2"
              onKeyDown={handleResultsKeyDown}
            >
              {isSearching ? (
                <div className="text-gray-500 text-center py-2">
                  {COPY.SEARCHING}
                </div>
              ) : (
                <SearchResultList
                  results={searchResults}
                  onResultClick={selectFile}
                  selectedPath={selectedPath || undefined}
                  query={searchQuery}
                />
              )}
            </div>
          ) : (
            <div className="px-2 pb-2">
              <FileTree
                nodes={nodes}
                onFileSelect={selectFile}
                selectedPath={selectedPath || undefined}
                selectedPaths={selectedPaths}
                onToggleSelect={toggleSelectPath}
                multiSelectMode={multiSelectMode}
              />
            </div>
          )}
        </div>
      </Card>

      <Card
        className={`${MOBILE_NO_CARD_CLS} ${contentVisibilityCls} flex-1 overflow-hidden flex-col`}
      >
        {showGraph && renderGraph ? (
          <div className="relative w-full h-full">
            <div className="absolute top-2 left-2 z-10 md:hidden">
              <IconButton
                variant="ghost"
                icon="arrow-left"
                onClick={showSidebarOnMobile}
                aria-label={COPY.BACK_TO_FILES}
              />
            </div>
            <div className="absolute top-2 right-2 z-10">
              <IconButton
                variant="ghost"
                icon="x"
                onClick={() => setShowGraph(false)}
                aria-label={COPY.HIDE_GRAPH}
              />
            </div>
            {renderGraph(selectFile)}
          </div>
        ) : !selectedPath && !hasSelection ? (
          <CenteredMessage>{emptyMessage}</CenteredMessage>
        ) : (hasSelection ? isLoadingAggregate : isLoadingContent) ? (
          <CenteredMessage>
            {hasSelection ? COPY.LOADING_AGGREGATE : COPY.LOADING_CONTENT}
          </CenteredMessage>
        ) : (hasSelection ? aggregateError : contentError) ? (
          <CenteredMessage tone="error">
            {hasSelection ? aggregateError : contentError}
          </CenteredMessage>
        ) : (
          <div className="relative w-full h-full overflow-auto">
            <div className="absolute top-2 left-2 z-10 md:hidden">
              <IconButton
                variant="ghost"
                icon="arrow-left"
                onClick={showSidebarOnMobile}
                aria-label={COPY.BACK_TO_FILES}
              />
            </div>
            <div className="absolute top-2 right-2 z-10">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton
                    variant="ghost"
                    icon="ellipsis-horizontal"
                    aria-label={COPY.DOCUMENT_ACTIONS}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {viewModes && viewModes.length > 0 && (
                    <>
                      {viewModes.map(mode => (
                        <DropdownMenu.Item
                          key={mode.value}
                          onSelect={() => onViewModeChange?.(mode.value)}
                          className={
                            currentViewMode === mode.value
                              ? 'font-semibold'
                              : ''
                          }
                        >
                          {mode.label}
                        </DropdownMenu.Item>
                      ))}
                      <DropdownMenu.Separator />
                    </>
                  )}
                  {onEdit && !isAggregate && (
                    <DropdownMenu.Item onSelect={onEdit}>
                      {COPY.EDIT}
                    </DropdownMenu.Item>
                  )}
                  {extraActions &&
                    !isAggregate &&
                    selectedPath &&
                    extraActions(selectedPath).map(action => (
                      <DropdownMenu.Item
                        key={action.label}
                        onSelect={action.onSelect}
                      >
                        {action.label}
                      </DropdownMenu.Item>
                    ))}
                  {isAggregate && (
                    <>
                      <DropdownMenu.RadioGroup
                        value={aggregateMode}
                        onValueChange={value =>
                          setAggregateMode(value as AggregateMode)
                        }
                      >
                        {(Object.values(AGGREGATE_MODE) as AggregateMode[]).map(
                          mode => (
                            <DropdownMenu.RadioItem key={mode} value={mode}>
                              {AGGREGATE_MODE_LABEL[mode]}
                            </DropdownMenu.RadioItem>
                          ),
                        )}
                      </DropdownMenu.RadioGroup>
                      <DropdownMenu.Separator />
                    </>
                  )}
                  <DropdownMenu.Item
                    onSelect={() =>
                      navigator.clipboard.writeText(
                        hasSelection ? aggregateContent : content,
                      )
                    }
                  >
                    {COPY.COPY_MARKDOWN}
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="md:hidden" />
                  <DropdownMenu.Item
                    onSelect={showSidebarOnMobile}
                    className="md:hidden"
                  >
                    {COPY.BACK_TO_FILES}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
            {renderContent ? (
              renderContent(
                hasSelection ? aggregateContent : content,
                selectFile,
                hasSelection
                  ? selectedPaths
                  : selectedPath
                    ? [selectedPath]
                    : [],
              )
            ) : (
              <pre className="whitespace-pre-wrap px-4 sm:px-6 py-4 text-sm">
                {hasSelection ? aggregateContent : content}
              </pre>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

const CenteredMessage = ({
  children,
  tone = 'muted',
}: {
  children: ReactNode;
  tone?: 'muted' | 'error';
}) => (
  <div
    className={`flex items-center justify-center h-full ${
      tone === 'error' ? 'text-red-500' : 'text-gray-500'
    }`}
  >
    {children}
  </div>
);

const FileTree = ({
  nodes,
  onFileSelect,
  selectedPath,
  selectedPaths,
  onToggleSelect,
  multiSelectMode,
}: {
  nodes: DocsNode[];
  onFileSelect: (path: string) => void;
  selectedPath?: string;
  selectedPaths: string[];
  onToggleSelect: (path: string) => void;
  multiSelectMode: boolean;
}) => (
  <div className="w-full">
    {nodes.map(node => (
      <FileTreeNode
        key={node.path}
        node={node}
        onFileSelect={onFileSelect}
        selectedPath={selectedPath}
        selectedPaths={selectedPaths}
        onToggleSelect={onToggleSelect}
        multiSelectMode={multiSelectMode}
      />
    ))}
  </div>
);

const FileTreeNode = ({
  node,
  onFileSelect,
  selectedPath,
  selectedPaths,
  onToggleSelect,
  multiSelectMode,
  depth = 0,
}: {
  node: DocsNode;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
  selectedPaths: string[];
  onToggleSelect: (path: string) => void;
  multiSelectMode: boolean;
  depth?: number;
}) => {
  const shouldBeExpanded = selectedPath
    ? selectedPath.startsWith(`${node.path}/`) || selectedPath === node.path
    : false;
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedPath === node.path;

  useEffect(() => {
    if (shouldBeExpanded) setIsExpanded(true);
  }, [shouldBeExpanded]);

  const handleClick = () => {
    if (node.type === NODE_TYPE_DIRECTORY) {
      setIsExpanded(prev => !prev);
    } else if (multiSelectMode) {
      onToggleSelect(node.path);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: `${depth * INDENT_PX + INDENT_BASE_PX}px` }}
        onClick={handleClick}
      >
        {node.type === NODE_TYPE_DIRECTORY ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <Folder className="w-4 h-4 flex-shrink-0" />
          </>
        ) : (
          <>
            {multiSelectMode && (
              <input
                type="checkbox"
                className="w-3.5 h-3.5 flex-shrink-0"
                checked={selectedPaths.includes(node.path)}
                onClick={e => e.stopPropagation()}
                onChange={() => onToggleSelect(node.path)}
              />
            )}
            <File className="w-4 h-4 flex-shrink-0" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {node.type === NODE_TYPE_DIRECTORY && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
              selectedPaths={selectedPaths}
              onToggleSelect={onToggleSelect}
              multiSelectMode={multiSelectMode}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SearchResultList = ({
  results,
  onResultClick,
  selectedPath,
  query,
}: {
  results: DocsSearchResult[];
  onResultClick: (path: string) => void;
  selectedPath?: string;
  query: string;
}) => {
  if (results.length === 0) return null;
  return (
    <Fragment>
      {results.map((result, index) => {
        const isFilename = result.matchType === MATCH_TYPE_FILENAME;
        const isSelected = selectedPath === result.path;
        return (
          <button
            key={result.path}
            type="button"
            data-search-result-index={index}
            className={`w-full text-left flex flex-col gap-1 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 ${
              isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            onClick={() => onResultClick(result.path)}
          >
            <div className="flex items-center gap-2">
              {isFilename ? (
                <File className="w-4 h-4 flex-shrink-0 text-blue-500" />
              ) : (
                <FileText className="w-4 h-4 flex-shrink-0 text-green-500" />
              )}
              <span className="text-sm font-medium truncate">
                <HighlightMatch text={result.name} query={query} />
              </span>
              <Badge
                size="1"
                color={isFilename ? 'blue' : 'green'}
                className="ml-auto flex-shrink-0"
              >
                {isFilename ? 'Name' : 'Content'}
              </Badge>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 pl-6 truncate">
              {result.path}
            </div>
            {result.excerpt && (
              <div className="text-xs text-gray-500 dark:text-gray-500 pl-6 line-clamp-2">
                <HighlightMatch text={result.excerpt} query={query} />
              </div>
            )}
          </button>
        );
      })}
    </Fragment>
  );
};
