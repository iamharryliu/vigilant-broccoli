'use client';

import {
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  Trash2,
  Upload,
} from 'lucide-react';
import { FILE_ENTRY_KIND, FileEntry } from '@vigilant-broccoli/common-js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './AlertDialog';
import { Button } from './Button';
import { ContextMenu } from './ContextMenu';
import { Skeleton } from './Skeleton';
import {
  groupByDirectory,
  isFileDrag,
  joinPath,
  readDroppedFiles,
} from './file-explorer-drop.utils';

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
const PDF_EXTENSION = 'pdf';
const TEXT_EXTENSIONS = [
  PDF_EXTENSION,
  'txt',
  'md',
  'doc',
  'docx',
  'json',
  'html',
];
const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];
const BYTES_PER_UNIT = 1024;
const OBJECT_URL_REVOKE_DELAY_MS = 60_000;
const PATH_SEPARATOR = '/';
const PATH_QUERY_PARAM = 'path';
const THUMBNAIL_ROOT_MARGIN = '200px';
const GRID_TEMPLATE_COLUMNS = 'repeat(auto-fill, minmax(120px, 1fr))';

const NAVIGATION_KEY = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  ENTER: 'Enter',
} as const;

// The grid auto-fills its columns, so the count is only known from layout.
const gridColumnCount = (element: HTMLElement | null) =>
  element ? getComputedStyle(element).gridTemplateColumns.split(' ').length : 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

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

const isFile = (entry: FileEntry) => entry.kind === FILE_ENTRY_KIND.FILE;

const isImageFile = (entry: FileEntry) =>
  isFile(entry) && IMAGE_EXTENSIONS.includes(getExtension(entry.name));

type FetchFileBlob = (path: string) => Promise<Blob>;

type ObjectUrlState = {
  url: string | null;
  loading: boolean;
  error: string | null;
};

const IDLE_OBJECT_URL: ObjectUrlState = {
  url: null,
  loading: false,
  error: null,
};

// The file route needs the bearer token, so `<img src>`/`<iframe src>` can't
// load it directly. Each change of `path` (or `version`, so a re-upload under
// the same name refreshes) revokes the previous URL, and responses for a path
// that is no longer current are dropped.
const useFileObjectUrl = (
  fetchFileBlob: FetchFileBlob,
  path: string | null,
  version?: string,
) => {
  const [state, setState] = useState<ObjectUrlState>(IDLE_OBJECT_URL);

  useEffect(() => {
    if (!path) {
      setState(IDLE_OBJECT_URL);
      return;
    }
    let current = true;
    let url: string | null = null;
    setState({ url: null, loading: true, error: null });
    fetchFileBlob(path)
      .then(blob => {
        if (!current) return;
        url = URL.createObjectURL(blob);
        setState({ url, loading: false, error: null });
      })
      .catch(err => {
        if (!current) return;
        setState({
          url: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load file',
        });
      });
    return () => {
      current = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fetchFileBlob, path, version]);

  return state;
};

// Fetches only once the tile scrolls into view; the icon shows until then and
// on failure.
const GridThumbnail = ({
  entry,
  fetchFileBlob,
}: {
  entry: FileEntry;
  fetchFileBlob: FetchFileBlob;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(
      observed => {
        if (observed.some(item => item.isIntersecting)) setVisible(true);
      },
      { rootMargin: THUMBNAIL_ROOT_MARGIN },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  const { url } = useFileObjectUrl(
    fetchFileBlob,
    visible ? entry.path : null,
    entry.modified,
  );

  return (
    <div
      ref={ref}
      className="flex h-16 w-16 items-center justify-center text-gray-400 dark:text-gray-500"
    >
      {url ? (
        <img
          src={url}
          alt={entry.name}
          className="h-full w-full rounded object-cover"
        />
      ) : (
        <EntryIcon entry={entry} size={48} />
      )}
    </div>
  );
};

const FilePreview = ({
  entry,
  fetchFileBlob,
}: {
  entry: FileEntry;
  fetchFileBlob: FetchFileBlob;
}) => {
  const extension = getExtension(entry.name);
  const embeddable =
    IMAGE_EXTENSIONS.includes(extension) || extension === PDF_EXTENSION;
  const { url, loading, error } = useFileObjectUrl(
    fetchFileBlob,
    embeddable ? entry.path : null,
    entry.modified,
  );

  if (!embeddable) {
    return (
      <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
        <EntryIcon entry={entry} size={64} />
        {extension && (
          <span className="text-xs font-medium">{extension.toUpperCase()}</span>
        )}
      </div>
    );
  }
  if (loading) return <Skeleton className="h-full w-full" />;
  if (error || !url) {
    return (
      <div className="px-4 text-center text-xs text-red-500">
        {error ?? 'Failed to load file'}
      </div>
    );
  }
  if (extension === PDF_EXTENSION) {
    return (
      <iframe src={url} title={entry.name} className="h-full w-full border-0" />
    );
  }
  return (
    <img
      src={url}
      alt={entry.name}
      className="max-h-full max-w-full object-contain"
    />
  );
};

const PreviewSidebar = ({
  entry,
  open,
  onToggle,
  onOpen,
  fetchFileBlob,
}: {
  entry: FileEntry;
  open: boolean;
  onToggle: () => void;
  onOpen: () => void;
  fetchFileBlob: FetchFileBlob;
}) => (
  <aside
    aria-label="File preview"
    className={`relative flex-shrink-0 border-l border-gray-100 transition-all dark:border-gray-800 ${open ? 'w-72' : 'w-0'}`}
  >
    <button
      type="button"
      aria-label={open ? 'Collapse preview' : 'Expand preview'}
      aria-expanded={open}
      onClick={onToggle}
      className="absolute -left-4 top-1/2 z-20 flex h-10 w-4 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      {open ? '›' : '‹'}
    </button>
    <div className="h-full overflow-hidden">
      <div className="flex h-full w-72 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex h-64 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900">
          <FilePreview
            key={entry.path}
            entry={entry}
            fetchFileBlob={fetchFileBlob}
          />
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <div className="break-all font-medium text-gray-800 dark:text-gray-100">
            {entry.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {entrySizeLabel(entry)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(entry.modified)}
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onOpen}>
          Open
        </Button>
      </div>
    </div>
  </aside>
);

const iconButtonClassName = (active = false) =>
  `inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800 ${
    active ? 'bg-gray-100 dark:bg-gray-800' : ''
  }`;

const itemClassName = (selected: boolean) =>
  selected
    ? 'bg-blue-50 dark:bg-blue-950'
    : 'hover:bg-gray-50 dark:hover:bg-gray-900';

const UploadButton = ({
  disabled,
  onFiles,
}: {
  disabled: boolean;
  onFiles: (files: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={event => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <button
        type="button"
        aria-label="Upload files"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={iconButtonClassName()}
      >
        <Upload size={14} />
      </button>
    </>
  );
};

const fileCountLabel = (count: number) =>
  `${count} file${count === 1 ? '' : 's'}`;

// Shared by the toolbar button and the context menu so both confirm the same way.
const DeleteFilesDialog = ({
  files,
  onClose,
  onConfirm,
}: {
  files: FileEntry[] | null;
  onClose: () => void;
  onConfirm: (files: FileEntry[]) => void;
}) => {
  const single = files?.length === 1 ? files[0] : null;
  const countLabel = fileCountLabel(files?.length ?? 0);
  return (
    <AlertDialog
      open={files !== null}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {single ? 'Delete file' : `Delete ${countLabel}`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Delete {single ? single.name : countLabel}? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={() => files && onConfirm(files)}
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// The menu content is portalled but nested inside the item in the React tree,
// so its events would otherwise bubble to the item's selection and open handlers.
const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

// `cursor` is the focused item that arrow keys move from; `anchor` is where a
// Shift range starts.
type Selection = {
  paths: ReadonlySet<string>;
  anchor: string | null;
  cursor: string | null;
};

const EMPTY_SELECTION: Selection = {
  paths: new Set(),
  anchor: null,
  cursor: null,
};

const selectOnly = (path: string): Selection => ({
  paths: new Set([path]),
  anchor: path,
  cursor: path,
});

const rangePaths = (entries: FileEntry[], fromIndex: number, toIndex: number) =>
  new Set(
    entries
      .slice(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex) + 1)
      .map(entry => entry.path),
  );

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
  // Shows an upload button that sends the picked files into the current folder
  // ('' at the root), and accepts files and folders dropped on the listing; a
  // dropped folder calls it once per subfolder with that subfolder's path.
  // Hidden when omitted.
  onUpload?: (folderPath: string, files: File[]) => Promise<void>;
  // Shows a delete button and context menu item for the selected files, behind
  // a confirmation; called once per file. Hidden when omitted; folders are
  // never offered.
  onDelete?: (entry: FileEntry) => Promise<void>;
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
  onUpload,
  onDelete,
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
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FileEntry[] | null>(null);
  const [mutating, setMutating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [dragging, setDragging] = useState(false);
  const itemsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      setSelection(EMPTY_SELECTION);
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
    setSelection(EMPTY_SELECTION);
    setQuery('');
    setCurrentPath(path);
    writePathToUrl(path);
  };

  // The file route needs the bearer token, so a plain link can't open it;
  // fetch the blob and hand the browser an object URL instead.
  const fetchFileBlob = useCallback(
    async (path: string) => {
      const response = await fetcher(
        `${fileEndpoint}?path=${encodeURIComponent(path)}`,
      );
      if (!response.ok) throw new Error((await response.json()).error);
      return response.blob();
    },
    [fileEndpoint, fetcher],
  );

  const openFile = async (entry: FileEntry) => {
    const preview = window.open('', '_blank');
    try {
      const url = URL.createObjectURL(await fetchFileBlob(entry.path));
      if (preview) preview.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
    } catch (err) {
      preview?.close();
      onError?.(err instanceof Error ? err.message : 'Failed to open file');
    }
  };

  const runMutation = async (action: () => Promise<void>, fallback: string) => {
    setMutating(true);
    try {
      await action();
      await loadEntries(currentPath ?? '');
    } catch (err) {
      onError?.(err instanceof Error ? err.message : fallback);
    } finally {
      setMutating(false);
    }
  };

  // Keyed by folder relative to the open one ('' for the open folder itself).
  const uploadGroups = (groups: Map<string, File[]>) => {
    if (!onUpload || groups.size === 0) return;
    runMutation(async () => {
      for (const [directory, files] of groups) {
        await onUpload(joinPath(currentPath ?? '', directory), files);
      }
    }, 'Failed to upload files');
  };

  const uploadFiles = (files: File[]) =>
    uploadGroups(files.length > 0 ? new Map([['', files]]) : new Map());

  const canDrop = !!onUpload && !mutating && currentPath !== null;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canDrop || !isFileDrag(event.dataTransfer)) return;
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    // Moving onto a child fires dragleave on the container too.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null))
      setDragging(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    if (!canDrop || !isFileDrag(event.dataTransfer)) return;
    event.preventDefault();
    setDragging(false);
    try {
      uploadGroups(
        groupByDirectory(await readDroppedFiles(event.dataTransfer)),
      );
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : 'Failed to read dropped files',
      );
    }
  };

  // One mutation so the listing reloads once; a failed file doesn't stop the rest.
  const deleteFiles = (files: FileEntry[]) => {
    if (!onDelete) return;
    runMutation(async () => {
      const results = await Promise.allSettled(
        files.map(file => onDelete(file)),
      );
      results.forEach(result => {
        if (result.status === 'rejected') {
          onError?.(
            result.reason instanceof Error
              ? result.reason.message
              : 'Failed to delete file',
          );
        }
      });
      setSelection(EMPTY_SELECTION);
    }, 'Failed to delete files');
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
  // Derived from what is on screen so a search never acts on hidden items.
  const selectedEntries = visibleEntries.filter(entry =>
    selection.paths.has(entry.path),
  );
  const selectedFiles = selectedEntries.filter(isFile);
  const selectedEntry =
    selectedEntries.length === 1 ? selectedEntries[0] : null;
  const previewEntry =
    selectedEntry && isFile(selectedEntry) ? selectedEntry : null;

  const visibleIndexOf = (path: string | null) =>
    visibleEntries.findIndex(item => item.path === path);

  // Keeps the anchor and moves the cursor; without a visible anchor it falls
  // back to selecting only the target.
  const extendSelectionTo = (index: number) => {
    const anchorIndex = visibleIndexOf(selection.anchor);
    const path = visibleEntries[index].path;
    setSelection(
      anchorIndex === -1
        ? selectOnly(path)
        : {
            paths: rangePaths(visibleEntries, anchorIndex, index),
            anchor: selection.anchor,
            cursor: path,
          },
    );
  };

  const selectEntry = (entry: FileEntry, event: MouseEvent) => {
    if (event.shiftKey) {
      extendSelectionTo(visibleEntries.indexOf(entry));
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      const paths = new Set(selection.paths);
      if (paths.has(entry.path)) paths.delete(entry.path);
      else paths.add(entry.path);
      setSelection({ paths, anchor: entry.path, cursor: entry.path });
      return;
    }
    setSelection(selectOnly(entry.path));
  };

  const keyStep = (key: string) => {
    if (viewMode === VIEW_MODE.LIST) {
      if (key === NAVIGATION_KEY.UP) return -1;
      if (key === NAVIGATION_KEY.DOWN) return 1;
      return null;
    }
    if (key === NAVIGATION_KEY.LEFT) return -1;
    if (key === NAVIGATION_KEY.RIGHT) return 1;
    if (key === NAVIGATION_KEY.UP) return -gridColumnCount(gridRef.current);
    if (key === NAVIGATION_KEY.DOWN) return gridColumnCount(gridRef.current);
    return null;
  };

  const handleItemsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Only the container itself: this skips inputs and the sort header buttons
    // (Enter must still activate them), and the context menu, which is
    // portalled but bubbles here through the React tree.
    if (
      event.target !== event.currentTarget ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      menuPath !== null ||
      pendingDelete !== null
    )
      return;
    if (event.key === NAVIGATION_KEY.ENTER) {
      if (!selectedEntry) return;
      event.preventDefault();
      openEntry(selectedEntry);
      return;
    }
    const step = keyStep(event.key);
    if (step === null) return;
    event.preventDefault();
    if (visibleEntries.length === 0) return;
    const cursorIndex = visibleIndexOf(selection.cursor);
    const index =
      cursorIndex === -1
        ? 0
        : clamp(cursorIndex + step, 0, visibleEntries.length - 1);
    if (event.shiftKey && cursorIndex !== -1) extendSelectionTo(index);
    else setSelection(selectOnly(visibleEntries[index].path));
    itemsRef.current
      ?.querySelector(`[data-path="${CSS.escape(visibleEntries[index].path)}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  };

  // A right-click outside the selection retargets it; inside, it keeps a multi-selection.
  const menuTargets = (entry: FileEntry) =>
    selection.paths.has(entry.path) ? selectedEntries : [entry];

  const menuDeletableFiles = (targets: FileEntry[]) =>
    onDelete ? targets.filter(isFile) : [];

  const hasMenuItems = (targets: FileEntry[]) =>
    targets.length === 1 || menuDeletableFiles(targets).length > 0;

  const changeMenuOpen = (entry: FileEntry, open: boolean) => {
    if (!open) {
      setMenuPath(null);
      return;
    }
    if (!selection.paths.has(entry.path)) setSelection(selectOnly(entry.path));
    if (hasMenuItems(menuTargets(entry))) setMenuPath(entry.path);
  };

  const renderMenu = (entry: FileEntry) => {
    if (menuPath !== entry.path) return null;
    const targets = menuTargets(entry);
    const files = menuDeletableFiles(targets);
    const single = targets.length === 1 ? targets[0] : null;
    return (
      <ContextMenu.Content
        onClick={stopPropagation}
        onDoubleClick={stopPropagation}
        onPointerDown={stopPropagation}
        onContextMenu={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
        // Items aren't focusable, and returning focus would fight the delete dialog.
        onCloseAutoFocus={event => event.preventDefault()}
      >
        {single && (
          <ContextMenu.Item onSelect={() => openEntry(single)}>
            Open
          </ContextMenu.Item>
        )}
        {files.length > 0 && (
          <ContextMenu.Item
            color="red"
            disabled={mutating}
            onSelect={() => setPendingDelete(files)}
          >
            <Trash2 size={14} />
            {single ? 'Delete' : `Delete ${fileCountLabel(files.length)}`}
          </ContextMenu.Item>
        )}
      </ContextMenu.Content>
    );
  };

  // Each item gets its own menu root so right-clicks on empty space or the
  // toolbar keep the browser's native menu.
  const withMenu = (entry: FileEntry, item: ReactElement) => (
    <ContextMenu.Root
      key={entry.path}
      modal={false}
      open={menuPath === entry.path}
      onOpenChange={open => changeMenuOpen(entry, open)}
    >
      <ContextMenu.Trigger>{item}</ContextMenu.Trigger>
    </ContextMenu.Root>
  );

  const itemProps = (entry: FileEntry) => ({
    'aria-selected': selection.paths.has(entry.path),
    'data-path': entry.path,
    onClick: (event: MouseEvent) => {
      selectEntry(entry, event);
      itemsRef.current?.focus({ preventScroll: true });
    },
    onDoubleClick: () => openEntry(entry),
  });
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
          {onUpload && (
            <UploadButton
              disabled={mutating || currentPath === null}
              onFiles={uploadFiles}
            />
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={
                selectedFiles.length > 1 ? 'Delete files' : 'Delete file'
              }
              disabled={mutating || selectedFiles.length === 0}
              onClick={() => setPendingDelete(selectedFiles)}
              className={iconButtonClassName()}
            >
              <Trash2 size={14} />
            </button>
          )}
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
            {loading || mutating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div
          ref={itemsRef}
          tabIndex={0}
          aria-label="Files"
          onKeyDown={handleItemsKeyDown}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600 ${dragging ? 'bg-blue-50 ring-2 ring-inset ring-blue-400 dark:bg-blue-950/30 dark:ring-blue-500' : ''}`}
          onClick={event => {
            if (event.target === event.currentTarget)
              setSelection(EMPTY_SELECTION);
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
                {visibleEntries.map(entry =>
                  withMenu(
                    entry,
                    <tr
                      {...itemProps(entry)}
                      className={`cursor-pointer border-b border-gray-100 transition-colors dark:border-gray-800 ${itemClassName(selection.paths.has(entry.path))}`}
                    >
                      <td className="w-14 px-4 py-2">
                        <div className="flex h-9 w-9 items-center justify-center text-gray-400 dark:text-gray-500">
                          <EntryIcon entry={entry} size={20} />
                        </div>
                        {renderMenu(entry)}
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
                    </tr>,
                  ),
                )}
              </tbody>
            </table>
          ) : (
            <div
              ref={gridRef}
              className="grid select-none gap-3 p-4"
              style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
            >
              {visibleEntries.map(entry =>
                withMenu(
                  entry,
                  <div
                    {...itemProps(entry)}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-md p-2 text-center transition-colors ${itemClassName(selection.paths.has(entry.path))}`}
                  >
                    {isImageFile(entry) ? (
                      <GridThumbnail
                        entry={entry}
                        fetchFileBlob={fetchFileBlob}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center text-gray-400 dark:text-gray-500">
                        <EntryIcon entry={entry} size={48} />
                      </div>
                    )}
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
                    {renderMenu(entry)}
                  </div>,
                ),
              )}
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
        {previewEntry && (
          <PreviewSidebar
            entry={previewEntry}
            open={previewOpen}
            onToggle={() => setPreviewOpen(open => !open)}
            onOpen={() => openFile(previewEntry)}
            fetchFileBlob={fetchFileBlob}
          />
        )}
      </div>

      <div
        role="status"
        className="flex flex-shrink-0 items-center gap-1.5 border-t border-gray-100 bg-gray-50 px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 dark:border-gray-800 dark:bg-gray-900"
      >
        {itemCountLabel(visibleEntries.length)}
        {selectedEntries.length > 1
          ? ` · ${selectedEntries.length} selected`
          : selectedEntry &&
            ` · ${selectedEntry.name} · ${entrySizeLabel(selectedEntry)}`}
      </div>

      <DeleteFilesDialog
        files={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteFiles}
      />
    </div>
  );
};
