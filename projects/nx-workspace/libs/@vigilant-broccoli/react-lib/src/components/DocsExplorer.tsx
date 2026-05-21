'use client';

import { Badge, Card, DropdownMenu, TextField } from '@radix-ui/themes';
import { IconButton } from './IconButton';
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

export interface DocsExplorerUrlSync {
  get: () => string | null;
  set: (path: string) => void;
}

interface DocsExplorerProps {
  nodes: DocsNode[];
  getContent: (path: string) => Promise<string>;
  renderContent?: (content: string) => ReactNode;
  search?: (query: string) => Promise<DocsSearchResult[]>;
  urlSync?: DocsExplorerUrlSync;
  sidebarTitle?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
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
} as const;

export const DocsExplorer = ({
  nodes,
  getContent,
  renderContent,
  search,
  urlSync,
  sidebarTitle = COPY.SIDEBAR_TITLE,
  searchPlaceholder = COPY.SEARCH_PLACEHOLDER,
  emptyMessage = COPY.EMPTY_MESSAGE,
}: DocsExplorerProps) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocsSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const selectFile = useCallback(
    async (path: string) => {
      setSelectedPath(path);
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
    }
  }, [urlSync, selectedPath, selectFile]);

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

  return (
    <div className="h-full flex gap-4">
      <Card className="w-80 flex-shrink-0 overflow-hidden flex flex-col">
        <div className="px-3 pt-3 pb-2">
          <h2 className="text-sm font-semibold mb-1.5">{sidebarTitle}</h2>
          {search && (
            <>
              <TextField.Root
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
              >
                <TextField.Slot>
                  <SearchIcon className="w-4 h-4" />
                </TextField.Slot>
              </TextField.Root>
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
              />
            </div>
          )}
        </div>
      </Card>

      <Card className="flex-1 overflow-hidden">
        {!selectedPath ? (
          <CenteredMessage>{emptyMessage}</CenteredMessage>
        ) : isLoadingContent ? (
          <CenteredMessage>{COPY.LOADING_CONTENT}</CenteredMessage>
        ) : contentError ? (
          <CenteredMessage tone="error">{contentError}</CenteredMessage>
        ) : (
          <div className="relative w-full h-full overflow-auto">
            <div className="absolute top-2 right-2 z-10">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton
                    variant="ghost"
                    icon="ellipsis-horizontal"
                    aria-label="Document actions"
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item
                    onSelect={() => navigator.clipboard.writeText(content)}
                  >
                    {COPY.COPY_MARKDOWN}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
            {renderContent ? (
              renderContent(content)
            ) : (
              <pre className="whitespace-pre-wrap px-6 py-4 text-sm">
                {content}
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
}: {
  nodes: DocsNode[];
  onFileSelect: (path: string) => void;
  selectedPath?: string;
}) => (
  <div className="w-full">
    {nodes.map(node => (
      <FileTreeNode
        key={node.path}
        node={node}
        onFileSelect={onFileSelect}
        selectedPath={selectedPath}
      />
    ))}
  </div>
);

const FileTreeNode = ({
  node,
  onFileSelect,
  selectedPath,
  depth = 0,
}: {
  node: DocsNode;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
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
            <span className="w-4 h-4 flex-shrink-0" />
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
