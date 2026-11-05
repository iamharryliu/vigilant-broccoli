'use client';

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUp,
  ChevronDown,
  ChevronUp,
  File as FileIcon,
  FileImage,
  FileText,
  Folder as FolderIcon,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { FILE_ENTRY_KIND, FileEntry } from '@vigilant-broccoli/common-js';

const VIEW_MODE = { LIST: 'list', GRID: 'grid' } as const;
type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

export const SORT_COLUMN = {
  NAME: 'name',
  SIZE: 'size',
  MODIFIED: 'modified',
} as const;
type SortColumn = (typeof SORT_COLUMN)[keyof typeof SORT_COLUMN];

export const SORT_DIRECTION = { ASC: 'asc', DESC: 'desc' } as const;
type SortDirection = (typeof SORT_DIRECTION)[keyof typeof SORT_DIRECTION];

export type SortState = { column: SortColumn; direction: SortDirection };

const COLUMNS: { column: SortColumn; label: string; className: string }[] = [
  { column: SORT_COLUMN.NAME, label: 'Name', className: '' },
  {
    column: SORT_COLUMN.SIZE,
    label: 'Size',
    className: 'hidden sm:table-cell',
  },
  {
    column: SORT_COLUMN.MODIFIED,
    label: 'Modified',
    className: 'hidden md:table-cell',
  },
];

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
const TEXT_EXTENSIONS = ['pdf', 'txt', 'md', 'doc', 'docx', 'json', 'html'];
const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];
const BYTES_PER_UNIT = 1024;
const OBJECT_URL_REVOKE_DELAY_MS = 60_000;
const PATH_SEPARATOR = '/';
const PATH_QUERY_PARAM = 'path';

const readPathFromUrl = () =>
  new URLSearchParams(window.location.search).get(PATH_QUERY_PARAM) ?? '';

const writePathToUrl = (path: string) => {
  const url = new URL(window.location.href);
  if (path) url.searchParams.set(PATH_QUERY_PARAM, path);
  else url.searchParams.delete(PATH_QUERY_PARAM);
  window.history.pushState(null, '', url);
};

const getExtension = (name: string) =>
  name.includes('.') ? (name.split('.').pop() ?? '').toLowerCase() : '';

const formatFileSize = (bytes: number) => {
  let size = bytes;
  let unitIndex = 0;
  while (size >= BYTES_PER_UNIT && unitIndex < FILE_SIZE_UNITS.length - 1) {
    size /= BYTES_PER_UNIT;
    unitIndex++;
  }
  return `${unitIndex === 0 ? size : size.toFixed(1)} ${FILE_SIZE_UNITS[unitIndex]}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const itemCountLabel = (count: number) =>
  `${count} item${count === 1 ? '' : 's'}`;

const entrySizeLabel = (entry: FileEntry) =>
  entry.kind === FILE_ENTRY_KIND.FOLDER
    ? itemCountLabel(entry.itemCount)
    : formatFileSize(entry.size);

const entrySizeValue = (entry: FileEntry) =>
  entry.kind === FILE_ENTRY_KIND.FOLDER ? entry.itemCount : entry.size;

// Folders always sort before files, like Finder/Explorer.
const sortEntries = (entries: FileEntry[], sort: SortState) => {
  const factor = sort.direction === SORT_DIRECTION.ASC ? 1 : -1;
  return [...entries].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === FILE_ENTRY_KIND.FOLDER ? -1 : 1;
    if (sort.column === SORT_COLUMN.SIZE) {
      return (entrySizeValue(a) - entrySizeValue(b)) * factor;
    }
    if (sort.column === SORT_COLUMN.MODIFIED) {
      return a.modified.localeCompare(b.modified) * factor;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true }) * factor;
  });
};

const EntryIcon = ({ entry, size }: { entry: FileEntry; size: number }) => {
  if (entry.kind === FILE_ENTRY_KIND.FOLDER) return <FolderIcon size={size} />;
  const extension = getExtension(entry.name);
  if (IMAGE_EXTENSIONS.includes(extension)) return <FileImage size={size} />;
  if (TEXT_EXTENSIONS.includes(extension)) return <FileText size={size} />;
  return <FileIcon size={size} />;
};

const iconButtonClassName = (active = false) =>
  `inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800 ${
    active ? 'bg-gray-100 dark:bg-gray-800' : ''
  }`;

const itemClassName = (selected: boolean) =>
  selected
    ? 'bg-blue-50 dark:bg-blue-950'
    : 'hover:bg-gray-50 dark:hover:bg-gray-900';

type FileExplorerProps = {
  rootLabel: string;
  // GET `?path=<relative>` -> `{ entries: FileEntry[] }`, or `{ error }` on failure.
  listEndpoint: string;
  // GET `?path=<relative>` -> the file's bytes, or `{ error }` on failure.
  fileEndpoint: string;
  // Swap in an authenticated fetch when the endpoints need credentials.
  fetcher?: typeof fetch;
  // Receives failures to open a file; list failures render in the empty state.
  onError?: (message: string) => void;
  defaultSort?: SortState;
  toolbarAction?: ReactNode;
};

const DEFAULT_SORT: SortState = {
  column: SORT_COLUMN.NAME,
  direction: SORT_DIRECTION.ASC,
};

export const FileExplorer = ({
  rootLabel,
  listEndpoint,
  fileEndpoint,
  fetcher = fetch,
  onError,
  defaultSort = DEFAULT_SORT,
  toolbarAction,
}: FileExplorerProps) => {
  // null until mounted: the folder lives in `?path=` so a page reload or the
  // browser's back/forward keeps it, and `window` is unavailable during SSR.
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.LIST);
  const [sort, setSort] = useState<SortState>(defaultSort);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const loadEntries = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetcher(
          `${listEndpoint}?path=${encodeURIComponent(path)}`,
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setEntries(data.entries);
      } catch (err) {
        setEntries([]);
        setError(err instanceof Error ? err.message : 'Failed to load folder');
      } finally {
        setLoading(false);
      }
    },
    [listEndpoint, fetcher],
  );

  useEffect(() => {
    const syncPathFromUrl = () => {
      setSelectedPath(null);
      setQuery('');
      setCurrentPath(readPathFromUrl());
    };
    syncPathFromUrl();
    window.addEventListener('popstate', syncPathFromUrl);
    return () => window.removeEventListener('popstate', syncPathFromUrl);
  }, []);

  useEffect(() => {
    if (currentPath !== null) loadEntries(currentPath);
  }, [currentPath, loadEntries]);

  const navigate = (path: string) => {
    if (path === currentPath) return;
    setSelectedPath(null);
    setQuery('');
    setCurrentPath(path);
    writePathToUrl(path);
  };

  // The file route needs the bearer token, so a plain link can't open it;
  // fetch the blob and hand the browser an object URL instead.
  const openFile = async (entry: FileEntry) => {
    const preview = window.open('', '_blank');
    try {
      const response = await fetcher(
        `${fileEndpoint}?path=${encodeURIComponent(entry.path)}`,
      );
      if (!response.ok) throw new Error((await response.json()).error);
      const url = URL.createObjectURL(await response.blob());
      if (preview) preview.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
    } catch (err) {
      preview?.close();
      onError?.(err instanceof Error ? err.message : 'Failed to open file');
    }
  };

  const openEntry = (entry: FileEntry) =>
    entry.kind === FILE_ENTRY_KIND.FOLDER
      ? navigate(entry.path)
      : openFile(entry);

  const toggleSort = (column: SortColumn) =>
    setSort(previous => ({
      column,
      direction:
        previous.column === column && previous.direction === SORT_DIRECTION.ASC
          ? SORT_DIRECTION.DESC
          : SORT_DIRECTION.ASC,
    }));

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? entries.filter(entry =>
          entry.name.toLowerCase().includes(normalizedQuery),
        )
      : entries;
    return sortEntries(filtered, sort);
  }, [entries, query, sort]);

  const segments = currentPath
    ? currentPath.split(PATH_SEPARATOR).map((name, index, parts) => ({
        name,
        path: parts.slice(0, index + 1).join(PATH_SEPARATOR),
      }))
    : [];
  const parentPath = segments[segments.length - 2]?.path ?? '';
  const selectedEntry = entries.find(entry => entry.path === selectedPath);
  const emptyText =
    error ?? (query ? 'No matching files' : 'This folder is empty');
  const showEmpty = !loading && visibleEntries.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-gray-950">
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-2 dark:border-gray-800">
        <button
          type="button"
          aria-label="Up one level"
          disabled={!currentPath}
          onClick={() => navigate(parentPath)}
          className={iconButtonClassName()}
        >
          <ArrowUp size={14} />
        </button>

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1 text-sm text-gray-600 dark:text-gray-300"
        >
          <button
            type="button"
            onClick={() => navigate('')}
            className="hover:text-gray-900 hover:underline dark:hover:text-white"
          >
            {rootLabel}
          </button>
          {segments.map(segment => (
            <span
              key={segment.path}
              className="flex min-w-0 items-center gap-1"
            >
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <button
                type="button"
                onClick={() => navigate(segment.path)}
                className="truncate hover:text-gray-900 hover:underline dark:hover:text-white"
              >
                {segment.name}
              </button>
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {toolbarAction}
          <div className="relative w-[180px]">
            <Search
              size={12}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              aria-label="Search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-gray-200 bg-white py-1 pl-7 pr-2 text-xs text-gray-700 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={viewMode === VIEW_MODE.LIST}
            onClick={() => setViewMode(VIEW_MODE.LIST)}
            className={iconButtonClassName(viewMode === VIEW_MODE.LIST)}
          >
            <List size={14} />
          </button>
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={viewMode === VIEW_MODE.GRID}
            onClick={() => setViewMode(VIEW_MODE.GRID)}
            className={iconButtonClassName(viewMode === VIEW_MODE.GRID)}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            aria-label="Refresh"
            disabled={loading}
            onClick={() => loadEntries(currentPath ?? '')}
            className={iconButtonClassName()}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        onClick={event => {
          if (event.target === event.currentTarget) setSelectedPath(null);
        }}
      >
        {viewMode === VIEW_MODE.LIST ? (
          <table className="w-full select-none text-sm">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              <tr>
                <th className="w-14 px-4 py-2" />
                {COLUMNS.map(({ column, label, className }) => {
                  const active = sort.column === column;
                  const Chevron =
                    sort.direction === SORT_DIRECTION.ASC
                      ? ChevronUp
                      : ChevronDown;
                  return (
                    <th
                      key={column}
                      className={`px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400 ${className}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        {label}
                        {active && <Chevron size={12} aria-hidden="true" />}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibleEntries.map(entry => (
                <tr
                  key={entry.path}
                  aria-selected={selectedPath === entry.path}
                  onClick={() => setSelectedPath(entry.path)}
                  onDoubleClick={() => openEntry(entry)}
                  className={`cursor-pointer border-b border-gray-100 transition-colors dark:border-gray-800 ${itemClassName(selectedPath === entry.path)}`}
                >
                  <td className="w-14 px-4 py-2">
                    <div className="flex h-9 w-9 items-center justify-center text-gray-400 dark:text-gray-500">
                      <EntryIcon entry={entry} size={20} />
                    </div>
                  </td>
                  <td className="max-w-[360px] truncate px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                    {entry.name}
                  </td>
                  <td className="hidden px-4 py-2 text-gray-500 dark:text-gray-400 sm:table-cell">
                    {entrySizeLabel(entry)}
                  </td>
                  <td className="hidden px-4 py-2 text-gray-500 dark:text-gray-400 md:table-cell">
                    {formatDate(entry.modified)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            className="grid select-none gap-3 p-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            }}
          >
            {visibleEntries.map(entry => (
              <div
                key={entry.path}
                aria-selected={selectedPath === entry.path}
                onClick={() => setSelectedPath(entry.path)}
                onDoubleClick={() => openEntry(entry)}
                className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-md p-2 text-center transition-colors ${itemClassName(selectedPath === entry.path)}`}
              >
                <div className="flex h-16 w-16 items-center justify-center text-gray-400 dark:text-gray-500">
                  <EntryIcon entry={entry} size={48} />
                </div>
                <div className="w-full">
                  <div className="line-clamp-2 break-words text-xs font-medium text-gray-800 dark:text-gray-100">
                    {entry.name}
                  </div>
                  {entry.kind === FILE_ENTRY_KIND.FOLDER && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                      {itemCountLabel(entry.itemCount)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && entries.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            Loading...
          </div>
        )}
        {showEmpty && (
          <div
            className={`px-4 py-16 text-center text-sm ${error ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {emptyText}
          </div>
        )}
      </div>

      <div
        role="status"
        className="flex flex-shrink-0 items-center gap-1.5 border-t border-gray-100 bg-gray-50 px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 dark:border-gray-800 dark:bg-gray-900"
      >
        {itemCountLabel(visibleEntries.length)}
        {selectedEntry &&
          ` · ${selectedEntry.name} · ${entrySizeLabel(selectedEntry)}`}
      </div>
    </div>
  );
};
