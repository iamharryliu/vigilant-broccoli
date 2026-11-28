'use client';

import {
  ArrowLeft,
  ChevronRight,
  Copy,
  File,
  FileText,
  Folder,
  Pencil,
  Search as SearchIcon,
  Share2,
  SquareCheckBig,
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
import {
  Button,
  Card,
  ClearableInput,
  DeleteItemConfirmationDialog,
  DropdownMenu,
  HighlightMatch,
  IconButton,
  shouldIgnoreShortcutKeystroke,
  useFocusSearchShortcut,
} from '@vigilant-broccoli/react-lib';

import { ShareDialog } from './share-dialog';

const MOBILE_NO_CARD_CLS =
  '!p-0 [&::before]:!hidden [&::after]:!hidden md:!p-3 md:[&::before]:![display:revert] md:[&::after]:![display:revert]';

// Matches Tailwind's `md:` breakpoint.
export const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';
export const MENU_ICON_SIZE = 14;
const CONTENT_BAR_CLS =
  'sticky top-0 z-10 flex items-center justify-between gap-2 px-2 py-1 border-b border-border bg-background/80 backdrop-blur-sm';
// Absolute children skip the card's md:p-3, so overlays add it back to land
// where the content bar's px-2 py-1 puts its buttons; the sidebar header uses
// the same px-2 pt-1, so the hide and show sidebar buttons swap in place.
const CONTENT_BAR_INSET_LEFT_CLS = 'top-1 left-2 md:top-4 md:left-5';
const CONTENT_BAR_INSET_RIGHT_CLS = 'top-1 right-2 md:top-4 md:right-5';
// The root graph view has no note heading to show, so its controls float over
// the graph instead; right-12 / md:right-16 clear the graph settings icon.
const FLOATING_CONTENT_BAR_CLS = `pointer-events-none absolute ${CONTENT_BAR_INSET_LEFT_CLS} right-12 md:right-16 z-10 flex items-center justify-between gap-2 [&>*]:pointer-events-auto`;

const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_UP = 'ArrowUp';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_TOGGLE_SIDEBAR = 'f';
const KEY_TOGGLE_GRAPH = 'g';
// Hover hint only: the accessible name stays the plain label.
const withShortcut = (label: string, key: string) => `${label} (${key})`;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_RESULT_ITEM_ATTR = 'data-search-result-index';
const NODE_TYPE_DIRECTORY = 'directory';
const MATCH_TYPE_FILENAME = 'filename';
const INDENT_PX = 16;
const INDENT_BASE_PX = 8;
const CHEVRON_CLS =
  'w-4 h-4 flex-shrink-0 transition-transform duration-200 ease-out';
const SUBTREE_CLS =
  'grid transition-[grid-template-rows] duration-200 ease-out';
const SUBTREE_ROWS_EXPANDED = 'grid-rows-[1fr]';
const SUBTREE_ROWS_COLLAPSED = 'grid-rows-[0fr]';
const LEADING_HEADING_RE = /^#\s[^\n]*\n+/;
const ALL_HEADINGS_RE = /^#{1,6}\s[^\n]*\n+/gm;
const AGGREGATE_SEPARATOR = '\n\n---\n\n';
const HASH_SEP = '#';
// Same `docs-md:` prefix as the viewer's other saved preferences.
const MULTI_SELECT_STORAGE_KEY = 'docs-md:multi-select';
const MULTI_SELECT_PATHS_STORAGE_KEY = 'docs-md:multi-select-paths';
const MULTI_SELECT_ON = 'on';
// Matches IconButton's default glyph size.
const MULTI_SELECT_ICON_SIZE = 16;
// A row shows the selected colour while pressed, since the click that selects
// it only fires on release.
const ROW_PRESSED_CLS = 'active:bg-blue-100 dark:active:bg-blue-900';
// About a second at 60fps for a combined view's section marker to render.
const SECTION_SCROLL_MAX_FRAMES = 60;
// Upper bound for a browser smooth scroll; no event marks its end.
const SMOOTH_SCROLL_MS = 900;
// A section counts as current once its start is within this of the bar.
const SECTION_EDGE_PX = 8;
const SUBSECTION_HEADINGS_SELECTOR = 'h2, h3, h4, h5, h6';
const SUBSECTION_SEPARATOR = ' › ';

const parseStoredPaths = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((path): path is string => typeof path === 'string')
      : [];
  } catch {
    return [];
  }
};

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
// Same `docs-md:` prefix as the viewer's other saved preferences.
const AGGREGATE_MODE_STORAGE_KEY = 'docs-md:aggregate-mode';
const isAggregateMode = (value: string | null): value is AggregateMode =>
  value !== null && (Object.values(AGGREGATE_MODE) as string[]).includes(value);

const AGGREGATE_TRANSFORM: Record<AggregateMode, (content: string) => string> =
  {
    [AGGREGATE_MODE.NONE]: content => content,
    [AGGREGATE_MODE.COLLAPSED]: stripLeadingHeading,
    [AGGREGATE_MODE.FLAT]: stripAllHeadings,
  };

// An empty element per source note, so clicking a selected file can scroll to
// its section. Only the displayed content carries them; copied markdown stays
// clean.
const AGGREGATE_SECTION_ATTR = 'data-aggregate-section';
// The collapsed and flat modes strip the headings the bar would show, so the
// marker carries the note title (from the raw content) for the bar instead.
const AGGREGATE_TITLE_ATTR = 'data-aggregate-title';
const TITLE_HEADING_RE = /^#\s+([^\n]*)/m;
const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const aggregateNoteTitle = (path: string, content: string) =>
  content.match(TITLE_HEADING_RE)?.[1].trim() ||
  (path.split('/').pop() ?? path).replace(/\.md$/, '');
const aggregateSectionMarker = (path: string, content: string) =>
  `<div ${AGGREGATE_SECTION_ATTR}="${escapeAttribute(path)}" ${AGGREGATE_TITLE_ATTR}="${escapeAttribute(aggregateNoteTitle(path, content))}"></div>\n\n`;

const buildAggregateContent = (
  contents: string[],
  mode: AggregateMode,
  markerPaths?: string[],
) =>
  contents
    .map(
      (content, index) =>
        (markerPaths?.[index]
          ? aggregateSectionMarker(markerPaths[index], content)
          : '') + AGGREGATE_TRANSFORM[mode](content),
    )
    .join(AGGREGATE_SEPARATOR);

export interface DocsNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: DocsNode[];
}

const flattenFilePaths = (nodes: DocsNode[]): string[] =>
  nodes.flatMap(node =>
    node.type === NODE_TYPE_DIRECTORY
      ? flattenFilePaths(node.children ?? [])
      : [node.path],
  );

const isDirectory = (node: DocsNode) => node.type === NODE_TYPE_DIRECTORY;

// Stable, so each group keeps the order the structure provided.
const directoriesFirst = (nodes: DocsNode[]) =>
  [...nodes].sort((a, b) => Number(isDirectory(b)) - Number(isDirectory(a)));

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
  // Optional edge weight (e.g. shared-item count) used to scale line width;
  // omitted links render at the default width, so existing graphs are unaffected.
  value?: number;
  // Looks up a `GraphView` `linkStyles` entry; unstyled links keep the default look.
  kind?: string;
}

export interface NoteGraph {
  nodes: NoteGraphNode[];
  links: NoteGraphLink[];
}

export interface DocsExplorerUrlSync {
  get: () => string | null;
  // `replace` rewrites the current history entry instead of adding one;
  // implementations without it keep pushing.
  set: (path: string, options?: { replace?: boolean }) => void;
  // Called when navigating back to the root (no file selected).
  clear?: () => void;
  // Notifies when the URL changes outside the explorer (browser back/forward);
  // returns an unsubscribe function.
  subscribe?: (onChange: () => void) => () => void;
}

export interface ViewModeOption {
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface DocsExplorerAction {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
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
  sidebarActions?: DocsExplorerAction[];
  enableMultiSelect?: boolean;
  onDeleteSelected?: (paths: string[]) => Promise<void>;
  viewModes?: ViewModeOption[];
  onViewModeChange?: (mode: string | undefined) => void;
  currentViewMode?: string;
  renderGraph?: (navigate: (path: string) => void) => ReactNode;
  getShareUrl?: (path: string) => string | null;
}

const COPY = {
  SIDEBAR_TITLE: 'Notes',
  SEARCH_PLACEHOLDER: 'Search files...',
  EMPTY_MESSAGE: 'Select a file to view its contents',
  SEARCHING: 'Searching...',
  NO_RESULTS: 'No results found',
  LOAD_CONTENT_ERROR: 'Failed to load file content',
  COPY_MARKDOWN: 'Copy markdown',
  SHARE: 'Share',
  EDIT: 'Edit',
  DOCUMENT_ACTIONS: 'Document actions',
  BACK_TO_FILES: 'Back to files',
  BACK_TO_PREVIOUS: 'Back to previous file',
  SELECTED_SUFFIX: 'selected',
  CLEAR_SELECTION: 'Clear',
  BACK_TO_SELECTION: 'Back to selection',
  DELETE_SELECTED: 'Delete selected',
  DELETE_SELECTED_TITLE: 'Delete selected files',
  DELETE_SELECTED_DESCRIPTION:
    'Are you sure you want to delete the selected files? This cannot be undone.',
  SIDEBAR_ACTIONS: 'Sidebar actions',
  CREATE_FILE: 'Create file',
  SELECT_MULTIPLE: 'Select multiple',
  TURN_OFF_MULTI_SELECT: 'Turn off multi-select',
  SHOW_GRAPH: 'Graph view',
  HIDE_GRAPH: 'Close graph view',
  GRAPH_TITLE: 'Graph',
  HIDE_SIDEBAR: 'Hide sidebar',
  SHOW_SIDEBAR: 'Show sidebar',
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
  sidebarActions,
  enableMultiSelect = false,
  onDeleteSelected,
  viewModes,
  onViewModeChange,
  currentViewMode,
  renderGraph,
  getShareUrl,
}: DocsExplorerProps) => {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const hasInitializedGraph = useRef(false);

  useEffect(() => {
    if (hasInitializedGraph.current) return;
    hasInitializedGraph.current = true;
    setShowGraph(
      Boolean(renderGraph) &&
        !urlSync?.get() &&
        window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
    );
  }, [renderGraph, urlSync]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // Mirrors selectedPath so openFile can read it without changing identity.
  const selectedPathRef = useRef<string | null>(null);
  const contentRequestIdRef = useRef(0);
  // null entries are the root view (no file open).
  const [history, setHistory] = useState<(string | null)[]>([]);
  const [content, setContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  // Whether the content pane shows the combined selection or the opened file.
  const [viewingSelection, setViewingSelection] = useState(false);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [aggregateSourceContents, setAggregateSourceContents] = useState<
    string[]
  >([]);
  // The paths the loaded contents came from, in the same order, so section
  // markers match even while a newer selection is still loading.
  const [aggregateSourcePaths, setAggregateSourcePaths] = useState<string[]>(
    [],
  );
  const [isLoadingAggregate, setIsLoadingAggregate] = useState(false);
  // A selected file the combined view should scroll to once it has rendered.
  const [scrollToSection, setScrollToSection] = useState<string | null>(null);
  // The section last jumped to in the combined view. The sidebar highlights it
  // there, since a jump does not change selectedPath (and its loaded content).
  const [activeSection, setActiveSection] = useState<string | null>(null);
  // Mirrors activeSection for the per-frame scroll handler, which updates it
  // only when the section under the bar changes.
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;
  // While a jump's smooth scroll runs, the sections it passes must not take
  // over the highlight.
  const programmaticScrollUntilRef = useRef(0);
  const [aggregateError, setAggregateError] = useState<string | null>(null);
  const [aggregateMode, setAggregateMode] = useState<AggregateMode>(
    AGGREGATE_MODE.NONE,
  );
  // Read after mount so server and first client render agree.
  useEffect(() => {
    const stored = window.localStorage.getItem(AGGREGATE_MODE_STORAGE_KEY);
    if (isAggregateMode(stored)) setAggregateMode(stored);
  }, []);
  const updateAggregateMode = (mode: AggregateMode) => {
    setAggregateMode(mode);
    if (mode === AGGREGATE_MODE.NONE)
      window.localStorage.removeItem(AGGREGATE_MODE_STORAGE_KEY);
    else window.localStorage.setItem(AGGREGATE_MODE_STORAGE_KEY, mode);
  };
  const hasSidebarActions = Boolean(sidebarActions?.length);
  const hasSelection = selectedPaths.length > 0;
  const showSelection = hasSelection && viewingSelection;
  const hasNote = Boolean(selectedPath) || showSelection;
  // The root graph view stays open: there is no note to toggle back to.
  const toggleGraph = useCallback(
    () => setShowGraph(prev => !prev || !hasNote),
    [hasNote],
  );
  const isAggregate = showSelection && selectedPaths.length > 1;
  // In the combined view the highlight follows the section jumped to, not the
  // last note opened on its own.
  const highlightedPath = showSelection
    ? activeSection && selectedPaths.includes(activeSection)
      ? activeSection
      : null
    : selectedPath;
  const aggregateContent = buildAggregateContent(
    aggregateSourceContents,
    aggregateMode,
  );
  const aggregateDisplayContent = buildAggregateContent(
    aggregateSourceContents,
    aggregateMode,
    aggregateSourcePaths,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocsSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [mobilePanel, setMobilePanel] = useState<'sidebar' | 'content'>(
    'sidebar',
  );
  // Desktop-only: mobile already swaps between the sidebar and content panels.
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const hasGraph = Boolean(renderGraph);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (shouldIgnoreShortcutKeystroke(event)) return;
      if (event.key === KEY_TOGGLE_SIDEBAR) {
        event.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      } else if (event.key === KEY_TOGGLE_GRAPH && hasGraph) {
        event.preventDefault();
        toggleGraph();
        setMobilePanel('content');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasGraph, toggleGraph]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const contentBarRef = useRef<HTMLDivElement>(null);
  const contentBodyRef = useRef<HTMLDivElement>(null);
  const stickyHeadingRef = useRef<HTMLSpanElement>(null);

  // Styles the bar heading directly per animation frame: routing scroll
  // progress through React state re-renders the whole explorer on every
  // scroll event, which made the fade stutter.
  useEffect(() => {
    const scroller = contentScrollRef.current;
    const bar = contentBarRef.current;
    const body = contentBodyRef.current;
    const label = stickyHeadingRef.current;
    if (!scroller || !bar || !body || !label) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const barBottom = bar.getBoundingClientRect().bottom;
      // In the combined view the bar follows the section under it: the last
      // marker at or above the bar's edge, else the first.
      const markers = Array.from(
        body.querySelectorAll<HTMLElement>(`[${AGGREGATE_SECTION_ATTR}]`),
      );
      let sectionIndex = -1;
      markers.forEach((marker, index) => {
        if (marker.getBoundingClientRect().top <= barBottom + SECTION_EDGE_PX)
          sectionIndex = index;
      });
      if (markers.length > 0 && sectionIndex === -1) sectionIndex = 0;
      const section = markers[sectionIndex];
      const nextSection = markers[sectionIndex + 1];
      const isInSection = (el: Element) =>
        !section ||
        (section.compareDocumentPosition(el) &
          Node.DOCUMENT_POSITION_FOLLOWING &&
          !(
            nextSection &&
            nextSection.compareDocumentPosition(el) &
              Node.DOCUMENT_POSITION_FOLLOWING
          ));
      const heading = Array.from(body.querySelectorAll('h1')).find(isInSection);
      // Subsections the reader has scrolled into: the last heading of each
      // level at or above the bar's edge, dropping any deeper one a later
      // shallower heading has since closed.
      const trail: string[] = [];
      const trailLevels: number[] = [];
      body
        .querySelectorAll<HTMLElement>(SUBSECTION_HEADINGS_SELECTOR)
        .forEach(sub => {
          if (
            !isInSection(sub) ||
            sub.getBoundingClientRect().top > barBottom + SECTION_EDGE_PX
          )
            return;
          const level = Number(sub.tagName[1]);
          while (
            trailLevels.length &&
            trailLevels[trailLevels.length - 1] >= level
          ) {
            trailLevels.pop();
            trail.pop();
          }
          trailLevels.push(level);
          trail.push(sub.textContent ?? '');
        });
      const sectionPath = section?.getAttribute(AGGREGATE_SECTION_ATTR);
      if (
        sectionPath &&
        sectionPath !== activeSectionRef.current &&
        Date.now() > programmaticScrollUntilRef.current
      ) {
        activeSectionRef.current = sectionPath;
        setActiveSection(sectionPath);
      }
      // Collapsed and flat modes leave no h1, so the section's marker title
      // stands in, fully shown.
      const fallbackTitle = heading
        ? null
        : section?.getAttribute(AGGREGATE_TITLE_ATTR);
      const title = heading?.textContent ?? fallbackTitle ?? '';
      const text = title
        ? [title, ...trail].join(SUBSECTION_SEPARATOR)
        : trail.join(SUBSECTION_SEPARATOR);
      if (label.textContent !== text) label.textContent = text;
      if (!heading) {
        label.style.opacity = text ? '1' : '0';
        label.style.transform = 'none';
        return;
      }
      const { top, height } = heading.getBoundingClientRect();
      const hidden = barBottom - top;
      const progress = Math.min(Math.max(hidden / height, 0), 1);
      label.style.opacity = String(progress);
      label.style.transform = `translateY(${(1 - progress) * 0.5}rem)`;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Viewers render their HTML after mount, so re-check once it lands.
    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(body, { childList: true, subtree: true });
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener('scroll', scheduleUpdate);
    };
  }, [
    showGraph,
    selectedPath,
    selectedPaths,
    isLoadingContent,
    isLoadingAggregate,
  ]);

  const toggleSelectPath = useCallback((path: string) => {
    setSelectedPaths(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path],
    );
    setViewingSelection(true);
    setShowGraph(false);
  }, []);

  const clearSelection = () => setSelectedPaths([]);

  // Shown while a single note or the graph covers the combined view; returns
  // to it at the section the user was last on.
  const returnToSelection = () => {
    setViewingSelection(true);
    setShowGraph(false);
    setMobilePanel('content');
    if (activeSection && selectedPaths.includes(activeSection))
      setScrollToSection(activeSection);
  };

  const toggleMultiSelectMode = () => {
    if (multiSelectMode) clearSelection();
    const next = !multiSelectMode;
    setMultiSelectMode(next);
    if (next)
      window.localStorage.setItem(MULTI_SELECT_STORAGE_KEY, MULTI_SELECT_ON);
    else window.localStorage.removeItem(MULTI_SELECT_STORAGE_KEY);
  };

  // Restored after mount so server and first client render agree; only apps
  // that offer multi-select read it.
  useEffect(() => {
    if (!enableMultiSelect) return;
    if (
      window.localStorage.getItem(MULTI_SELECT_STORAGE_KEY) === MULTI_SELECT_ON
    )
      setMultiSelectMode(true);
  }, [enableMultiSelect]);

  // Saving waits until the restore below has run, so the empty initial
  // selection cannot overwrite what was stored.
  const selectionRestoredRef = useRef(false);
  useEffect(() => {
    if (!enableMultiSelect || !selectionRestoredRef.current) return;
    if (multiSelectMode && selectedPaths.length > 0)
      window.localStorage.setItem(
        MULTI_SELECT_PATHS_STORAGE_KEY,
        JSON.stringify(selectedPaths),
      );
    else window.localStorage.removeItem(MULTI_SELECT_PATHS_STORAGE_KEY);
  }, [enableMultiSelect, multiSelectMode, selectedPaths]);

  const handleConfirmDeleteSelected = async () => {
    if (!onDeleteSelected) return;
    await onDeleteSelected(selectedPaths);
    clearSelection();
    setPendingBulkDelete(false);
  };

  useEffect(() => {
    if (!hasSelection) return;
    let cancelled = false;
    setIsLoadingAggregate(true);
    setAggregateError(null);
    const paths = selectedPaths;
    Promise.all(paths.map(getContent))
      .then(contents => {
        if (cancelled) return;
        setAggregateSourceContents(contents);
        setAggregateSourcePaths(paths);
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

  const openFile = useCallback(
    async (
      pathWithHash: string,
      { recordHistory = true, syncUrl = true } = {},
    ) => {
      setShowGraph(false);
      const [path, hash] = pathWithHash.split(HASH_SEP);
      const previous = selectedPathRef.current;
      if (recordHistory && previous !== path) {
        setHistory(prev => [...prev, previous]);
      }
      selectedPathRef.current = path;
      // Only touch the hash when the caller supplied one (a resolved cross-file
      // link) — plain path selections (tree, search, initial URL sync) leave
      // whatever's already in the URL alone, so a direct load of `?file=...#foo`
      // isn't clobbered by the initial mount echoing the file back into the URL.
      if (hash !== undefined) window.location.hash = hash;
      // Opening a file keeps any multi-select selection, so the user can read
      // notes while picking; the pane switches back to the combined view the
      // next time a checkbox changes.
      setViewingSelection(false);
      setSelectedPath(path);
      setMobilePanel('content');
      if (syncUrl) urlSync?.set(path);
      setIsLoadingContent(true);
      setContentError(null);
      // Rapid navigation can resolve loads out of order; only the latest
      // request may write, or an earlier file's content lands under a later
      // selection.
      const requestId = ++contentRequestIdRef.current;
      const isStale = () => requestId !== contentRequestIdRef.current;
      try {
        const next = await getContent(path);
        if (isStale()) return;
        setContent(next);
      } catch (err) {
        if (isStale()) return;
        setContentError(
          err instanceof Error ? err.message : COPY.LOAD_CONTENT_ERROR,
        );
        setContent('');
      } finally {
        if (!isStale()) setIsLoadingContent(false);
      }
    },
    [getContent, urlSync],
  );

  const selectFile = useCallback(
    (pathWithHash: string) => openFile(pathWithHash),
    [openFile],
  );

  // A sidebar click on a file that is part of a multi-file selection jumps to
  // its section of the combined view instead of opening it alone.
  const selectSidebarFile = (path: string) => {
    if (
      multiSelectMode &&
      selectedPaths.length > 1 &&
      selectedPaths.includes(path)
    ) {
      setViewingSelection(true);
      setMobilePanel('content');
      if (!showGraph) setScrollToSection(path);
      setActiveSection(path);
      // The URL still names the clicked file, so a refresh in multi-select
      // mode returns to this section of the combined view. Replacing keeps
      // section jumps out of the back stack.
      urlSync?.set(path, { replace: true });
      return;
    }
    openFile(path);
  };

  useEffect(() => {
    if (!scrollToSection || !showSelection || isLoadingAggregate) return;
    // The viewer writes its HTML after this render, so on a fresh load the
    // marker can appear a few frames late; keep looking for a short while.
    let frame = 0;
    let attempts = 0;
    const tryScroll = () => {
      const scroller = contentScrollRef.current;
      const marker = contentBodyRef.current?.querySelector(
        `[${AGGREGATE_SECTION_ATTR}="${CSS.escape(scrollToSection)}"]`,
      );
      if (!scroller || !marker) {
        if (++attempts < SECTION_SCROLL_MAX_FRAMES)
          frame = requestAnimationFrame(tryScroll);
        return;
      }
      // The content bar stays pinned at the top, so land just below it.
      const top =
        marker.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        (contentBarRef.current?.offsetHeight ?? 0);
      programmaticScrollUntilRef.current = Date.now() + SMOOTH_SCROLL_MS;
      scroller.scrollTo({ top, behavior: 'smooth' });
      setScrollToSection(null);
    };
    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [
    scrollToSection,
    showSelection,
    isLoadingAggregate,
    aggregateDisplayContent,
  ]);

  const showRoot = ({ syncUrl = true } = {}) => {
    contentRequestIdRef.current++;
    setIsLoadingContent(false);
    selectedPathRef.current = null;
    setSelectedPaths([]);
    setSelectedPath(null);
    setContent('');
    setContentError(null);
    setShowGraph(
      Boolean(renderGraph) && window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
    );
    setMobilePanel('sidebar');
    if (syncUrl) urlSync?.clear?.();
  };

  const goBack = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    if (previous === null) showRoot();
    else openFile(previous, { recordHistory: false });
  };

  // Browser back/forward already moved the URL, so reopen what it names
  // without writing it back. A move to the file on top of the in-page stack
  // counts as going back; anything else is recorded like a normal navigation.
  const handleUrlChange = () => {
    const path = urlSync?.get() ?? null;
    const current = selectedPathRef.current;
    if (path === current) return;
    setHistory(prev =>
      prev.length > 0 && prev[prev.length - 1] === path
        ? prev.slice(0, -1)
        : [...prev, current],
    );
    if (path) openFile(path, { recordHistory: false, syncUrl: false });
    else showRoot({ syncUrl: false });
  };
  const handleUrlChangeRef = useRef(handleUrlChange);
  handleUrlChangeRef.current = handleUrlChange;

  useEffect(
    () => urlSync?.subscribe?.(() => handleUrlChangeRef.current()),
    [urlSync],
  );

  // Runs once: re-reading the URL after going back to the root would reopen
  // the file when the consumer's urlSync has no clear().
  const hasSyncedInitialUrl = useRef(false);
  useEffect(() => {
    if (hasSyncedInitialUrl.current) return;
    hasSyncedInitialUrl.current = true;
    const initial = urlSync?.get();
    if (initial) {
      selectFile(initial);
      setMobilePanel('content');
    }
  }, [urlSync, selectFile]);

  // Ticked files are restored once the tree has loaded, keeping only paths
  // that still exist. Declared after the initial URL open so that, when both
  // run on mount, a refresh in multi-select mode lands on the combined view
  // rather than the `?file=` note.
  useEffect(() => {
    if (!enableMultiSelect || selectionRestoredRef.current) return;
    if (nodes.length === 0) return;
    selectionRestoredRef.current = true;
    if (
      window.localStorage.getItem(MULTI_SELECT_STORAGE_KEY) !== MULTI_SELECT_ON
    )
      return;
    const existing = new Set(flattenFilePaths(nodes));
    const stored = parseStoredPaths(
      window.localStorage.getItem(MULTI_SELECT_PATHS_STORAGE_KEY),
    ).filter(path => existing.has(path));
    if (stored.length === 0) return;
    setSelectedPaths(stored);
    setViewingSelection(true);
    setShowGraph(false);
    setMobilePanel('content');
    // `?file=` names the section the user was on when it is one of the ticked
    // files; scroll back to it once the combined view renders.
    const initial = urlSync?.get()?.split(HASH_SEP)[0];
    if (initial && stored.includes(initial)) {
      setScrollToSection(initial);
      setActiveSection(initial);
    }
  }, [enableMultiSelect, nodes, urlSync]);

  const showSidebarOnMobile = () => setMobilePanel('sidebar');

  const focusSearch = useCallback(() => {
    setMobilePanel('sidebar');
    setIsSidebarCollapsed(false);
    // The sidebar is display:none on mobile while the content panel shows
    // (visibility:hidden on desktop while collapsed), and an element can't
    // take focus until the next frame paints it.
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, []);
  useFocusSearchShortcut(focusSearch, { enabled: Boolean(search) });

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
      selectSidebarFile(searchResults[0].path);
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
  // The negative margin cancels the row's md:gap-4 so collapsed content sits
  // flush. Visibility drops tab stops: it is transitioned only when
  // collapsing, so expanding makes the sidebar focusable on the first frame
  // (a transitioned hidden→visible is still hidden at progress 0).
  const sidebarCollapseCls = isSidebarCollapsed
    ? 'md:w-0 md:-mr-4 md:opacity-0 md:invisible md:transition-[width,margin-right,opacity,visibility]'
    : 'md:w-80 md:transition-[width,margin-right,opacity]';
  const showSidebarButton = isSidebarCollapsed && (
    <span className="hidden md:inline-flex">
      <IconButton
        variant="ghost"
        icon="panel-left-open"
        aria-label={COPY.SHOW_SIDEBAR}
        title={withShortcut(COPY.SHOW_SIDEBAR, KEY_TOGGLE_SIDEBAR)}
        onClick={() => setIsSidebarCollapsed(false)}
      />
    </span>
  );
  const showGraphButton = renderGraph && (
    <IconButton
      variant={showGraph ? 'default' : 'ghost'}
      icon="graph"
      aria-label={showGraph ? COPY.HIDE_GRAPH : COPY.SHOW_GRAPH}
      title={withShortcut(
        showGraph ? COPY.HIDE_GRAPH : COPY.SHOW_GRAPH,
        KEY_TOGGLE_GRAPH,
      )}
      onClick={toggleGraph}
    />
  );
  // Note actions picked from the graph view swap back to the note they act on.
  const showNote = (action: () => void) => () => {
    setShowGraph(false);
    action();
  };
  // The scroll-driven heading and its refs only exist in the note view.
  const renderContentBar = (isGraphView: boolean) => (
    <div
      ref={isGraphView ? undefined : contentBarRef}
      className={
        isGraphView && !hasNote ? FLOATING_CONTENT_BAR_CLS : CONTENT_BAR_CLS
      }
    >
      <div className="flex min-w-0 items-center gap-1">
        {showSidebarButton}
        {history.length > 0 && (
          <IconButton
            variant="ghost"
            icon="arrow-left"
            onClick={goBack}
            aria-label={COPY.BACK_TO_PREVIOUS}
          />
        )}
        {!isGraphView && (
          <span
            ref={stickyHeadingRef}
            className="min-w-0 truncate pl-2 text-sm font-semibold opacity-0 will-change-[opacity,transform]"
            aria-hidden
          />
        )}
      </div>
      <div className="flex items-center gap-1">
        {(!isGraphView || hasNote) && showGraphButton}
        <DropdownMenu.Root>
          {/* Without a note the menu only holds the mobile "Back to files". */}
          <DropdownMenu.Trigger className={hasNote ? undefined : 'md:hidden'}>
            <IconButton
              variant="ghost"
              icon="ellipsis-horizontal"
              aria-label={COPY.DOCUMENT_ACTIONS}
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {hasNote && viewModes && viewModes.length > 0 && (
              <>
                {viewModes.map(mode => (
                  <DropdownMenu.Item
                    key={mode.value}
                    onSelect={showNote(() => onViewModeChange?.(mode.value))}
                    className={
                      currentViewMode === mode.value ? 'font-semibold' : ''
                    }
                  >
                    {mode.icon}
                    {mode.label}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator />
              </>
            )}
            {hasNote && (
              <>
                {onEdit && !isAggregate && (
                  <DropdownMenu.Item onSelect={showNote(onEdit)}>
                    <Pencil size={MENU_ICON_SIZE} />
                    {COPY.EDIT}
                  </DropdownMenu.Item>
                )}
                {extraActions &&
                  !isAggregate &&
                  selectedPath &&
                  extraActions(selectedPath).map(action => (
                    <DropdownMenu.Item
                      key={action.label}
                      onSelect={showNote(action.onSelect)}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenu.Item>
                  ))}
                {isAggregate && (
                  <>
                    <DropdownMenu.RadioGroup
                      value={aggregateMode}
                      onValueChange={value =>
                        updateAggregateMode(value as AggregateMode)
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
                {!isAggregate &&
                  selectedPath &&
                  getShareUrl?.(selectedPath) && (
                    <DropdownMenu.Item
                      onSelect={() => setShareUrl(getShareUrl(selectedPath))}
                    >
                      <Share2 size={MENU_ICON_SIZE} />
                      {COPY.SHARE}
                    </DropdownMenu.Item>
                  )}
                <DropdownMenu.Item
                  onSelect={() =>
                    navigator.clipboard.writeText(
                      showSelection ? aggregateContent : content,
                    )
                  }
                >
                  <Copy size={MENU_ICON_SIZE} />
                  {COPY.COPY_MARKDOWN}
                </DropdownMenu.Item>
              </>
            )}
            {hasNote && <DropdownMenu.Separator className="md:!hidden" />}
            <DropdownMenu.Item
              onSelect={showSidebarOnMobile}
              className="md:!hidden"
            >
              <ArrowLeft size={MENU_ICON_SIZE} />
              {COPY.BACK_TO_FILES}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
  const contentVisibilityCls =
    mobilePanel === 'content' ? 'flex' : '!hidden md:!flex';

  return (
    <>
      <div className="h-full flex gap-2 md:gap-4">
        <div
          className={`${sidebarVisibilityCls} ${sidebarCollapseCls} w-full md:flex-shrink-0 overflow-hidden md:duration-200 md:ease-out`}
        >
          <Card
            className={`${MOBILE_NO_CARD_CLS} flex w-full md:w-80 md:flex-shrink-0 overflow-hidden flex-col`}
          >
            <div className="px-2 pt-1 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <span className="hidden md:inline-flex">
                    <IconButton
                      variant="ghost"
                      icon="panel-left-close"
                      aria-label={COPY.HIDE_SIDEBAR}
                      title={withShortcut(
                        COPY.HIDE_SIDEBAR,
                        KEY_TOGGLE_SIDEBAR,
                      )}
                      onClick={() => setIsSidebarCollapsed(true)}
                    />
                  </span>
                  <h2 className="text-sm font-semibold">{sidebarTitle}</h2>
                </div>
                <div className="flex items-center gap-1">
                  {/* Desktop opens the graph from the content pane instead;
                      on mobile the file list is the only entry point. */}
                  {renderGraph && (
                    <span className="inline-flex md:hidden">
                      <IconButton
                        variant={showGraph ? 'default' : 'ghost'}
                        icon="graph"
                        aria-label={
                          showGraph ? COPY.HIDE_GRAPH : COPY.SHOW_GRAPH
                        }
                        onClick={() => {
                          toggleGraph();
                          setMobilePanel('content');
                        }}
                      />
                    </span>
                  )}
                  {onCreate && (
                    <IconButton
                      variant="ghost"
                      icon="plus"
                      aria-label={COPY.CREATE_FILE}
                      onClick={onCreate}
                    />
                  )}
                  {enableMultiSelect && (
                    // Styled like IconButton (the graph toggle); react-lib's
                    // icon set has no checkbox glyph.
                    <Button
                      size="icon"
                      variant={multiSelectMode ? 'default' : 'ghost'}
                      aria-pressed={multiSelectMode}
                      aria-label={
                        multiSelectMode
                          ? COPY.TURN_OFF_MULTI_SELECT
                          : COPY.SELECT_MULTIPLE
                      }
                      title={
                        multiSelectMode
                          ? COPY.TURN_OFF_MULTI_SELECT
                          : COPY.SELECT_MULTIPLE
                      }
                      onClick={toggleMultiSelectMode}
                    >
                      <SquareCheckBig size={MULTI_SELECT_ICON_SIZE} />
                    </Button>
                  )}
                  {hasSidebarActions && (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton
                          variant="ghost"
                          icon="ellipsis-horizontal"
                          aria-label={COPY.SIDEBAR_ACTIONS}
                        />
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        {sidebarActions?.map(action => (
                          <DropdownMenu.Item
                            key={action.label}
                            onSelect={action.onSelect}
                          >
                            {action.label}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  )}
                </div>
              </div>
              {search && (
                <>
                  <ClearableInput
                    ref={searchInputRef}
                    startAddon={<SearchIcon className="w-4 h-4" />}
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onClear={clearSearch}
                    onKeyDown={handleSearchInputKeyDown}
                  />
                  {isSearchMode && !isSearching && (
                    <div className="text-xs text-muted-foreground mt-1.5">
                      {searchResults.length === 0
                        ? COPY.NO_RESULTS
                        : `${searchResults.length} ${
                            searchResults.length === 1 ? 'result' : 'results'
                          }`}
                    </div>
                  )}
                </>
              )}
              {multiSelectMode && (
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
                  <span>
                    {hasSelection
                      ? `${selectedPaths.length} ${COPY.SELECTED_SUFFIX}`
                      : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {hasSelection && (!viewingSelection || showGraph) && (
                      <button
                        type="button"
                        onClick={returnToSelection}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {COPY.BACK_TO_SELECTION}
                      </button>
                    )}
                    {hasSelection && (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {COPY.CLEAR_SELECTION}
                      </button>
                    )}
                    {onDeleteSelected && hasSelection && (
                      <button
                        type="button"
                        onClick={() => setPendingBulkDelete(true)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        {COPY.DELETE_SELECTED}
                      </button>
                    )}
                  </div>
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
                    <div className="text-muted-foreground text-center py-2">
                      {COPY.SEARCHING}
                    </div>
                  ) : (
                    <SearchResultList
                      results={searchResults}
                      onResultClick={selectSidebarFile}
                      selectedPath={highlightedPath || undefined}
                      query={searchQuery}
                      selectedPaths={selectedPaths}
                      onToggleSelect={toggleSelectPath}
                      multiSelectMode={multiSelectMode}
                    />
                  )}
                </div>
              ) : (
                <div className="px-2 pb-2">
                  <FileTree
                    nodes={nodes}
                    onFileSelect={selectSidebarFile}
                    selectedPath={highlightedPath || undefined}
                    selectedPaths={selectedPaths}
                    onToggleSelect={toggleSelectPath}
                    multiSelectMode={multiSelectMode}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card
          className={`${MOBILE_NO_CARD_CLS} ${contentVisibilityCls} relative flex-1 overflow-hidden flex-col`}
        >
          {showGraph && renderGraph ? (
            <div className="w-full h-full flex flex-col">
              {renderContentBar(true)}
              <div className="relative flex-1 min-h-0">
                {renderGraph(selectFile)}
              </div>
            </div>
          ) : !selectedPath && !showSelection ? (
            <>
              {showSidebarButton && (
                <div className={`absolute ${CONTENT_BAR_INSET_LEFT_CLS} z-10`}>
                  {showSidebarButton}
                </div>
              )}
              {showGraphButton && (
                <div className={`absolute ${CONTENT_BAR_INSET_RIGHT_CLS} z-10`}>
                  {showGraphButton}
                </div>
              )}
              <CenteredMessage>{emptyMessage}</CenteredMessage>
            </>
          ) : (showSelection ? isLoadingAggregate : isLoadingContent) ? null : (
              showSelection ? aggregateError : contentError
            ) ? (
            <CenteredMessage tone="error">
              {showSelection ? aggregateError : contentError}
            </CenteredMessage>
          ) : (
            <div
              ref={contentScrollRef}
              className="w-full h-full overflow-auto flex flex-col"
            >
              {renderContentBar(false)}
              <div ref={contentBodyRef} className="flex-1 min-h-0">
                {renderContent ? (
                  renderContent(
                    showSelection ? aggregateDisplayContent : content,
                    selectFile,
                    showSelection
                      ? selectedPaths
                      : selectedPath
                        ? [selectedPath]
                        : [],
                  )
                ) : (
                  <pre className="whitespace-pre-wrap px-4 sm:px-6 py-4 text-sm">
                    {showSelection ? aggregateContent : content}
                  </pre>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
      {onDeleteSelected && (
        <DeleteItemConfirmationDialog
          open={pendingBulkDelete}
          onOpenChange={setPendingBulkDelete}
          title={COPY.DELETE_SELECTED_TITLE}
          description={COPY.DELETE_SELECTED_DESCRIPTION}
          confirmLabel={COPY.DELETE_SELECTED}
          deleteItem={handleConfirmDeleteSelected}
        />
      )}
      {getShareUrl && (
        <ShareDialog
          noteTitle={selectedPath?.split('/').pop() ?? ''}
          url={shareUrl}
          onOpenChange={open => !open && setShareUrl(null)}
        />
      )}
    </>
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
      tone === 'error' ? 'text-red-500' : 'text-muted-foreground'
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
    {directoriesFirst(nodes).map(node => (
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
  const [hasExpanded, setHasExpanded] = useState(false);
  const isSelected = selectedPath === node.path;

  const expand = (next: boolean) => {
    if (next) setHasExpanded(true);
    setIsExpanded(next);
  };

  useEffect(() => {
    if (!shouldBeExpanded) return;
    setHasExpanded(true);
    setIsExpanded(true);
  }, [shouldBeExpanded]);

  const handleClick = () => {
    if (node.type === NODE_TYPE_DIRECTORY) {
      expand(!isExpanded);
    } else {
      // In multi-select mode only the checkbox changes the selection, so a
      // row click still opens the note.
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted dark:hover:bg-muted ${ROW_PRESSED_CLS} rounded ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: `${depth * INDENT_PX + INDENT_BASE_PX}px` }}
        onClick={handleClick}
      >
        {node.type === NODE_TYPE_DIRECTORY ? (
          <>
            <ChevronRight
              className={`${CHEVRON_CLS} ${isExpanded ? 'rotate-90' : ''}`}
            />
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

      {node.type === NODE_TYPE_DIRECTORY && node.children && (
        <div
          className={`${SUBTREE_CLS} ${
            isExpanded ? SUBTREE_ROWS_EXPANDED : SUBTREE_ROWS_COLLAPSED
          }`}
        >
          <div className="overflow-hidden">
            {hasExpanded &&
              directoriesFirst(node.children).map(child => (
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
  selectedPaths,
  onToggleSelect,
  multiSelectMode,
}: {
  results: DocsSearchResult[];
  onResultClick: (path: string) => void;
  selectedPath?: string;
  query: string;
  selectedPaths: string[];
  onToggleSelect: (path: string) => void;
  multiSelectMode: boolean;
}) => {
  if (results.length === 0) return null;
  return (
    <Fragment>
      {results.map((result, index) => {
        const isFilename = result.matchType === MATCH_TYPE_FILENAME;
        const isSelected = selectedPath === result.path;
        const resultButton = (
          <button
            type="button"
            data-search-result-index={index}
            className={`w-full min-w-0 text-left flex flex-col gap-1 px-3 py-2 cursor-pointer hover:bg-muted dark:hover:bg-muted ${ROW_PRESSED_CLS} rounded border-b border-border focus:outline-none focus:bg-muted dark:focus:bg-muted ${
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
            </div>
            <div className="text-xs text-muted-foreground pl-6 truncate">
              {result.path}
            </div>
            {result.excerpt && (
              <div className="text-xs text-muted-foreground pl-6 line-clamp-2">
                <HighlightMatch text={result.excerpt} query={query} />
              </div>
            )}
          </button>
        );
        // A checkbox cannot sit inside the result button, so in multi-select
        // mode it goes beside it; the button still opens the note.
        return multiSelectMode ? (
          <div key={result.path} className="flex items-start gap-1">
            <input
              type="checkbox"
              aria-label={`Select ${result.name}`}
              className="mt-3 ml-1 h-3.5 w-3.5 flex-shrink-0"
              checked={selectedPaths.includes(result.path)}
              onChange={() => onToggleSelect(result.path)}
            />
            {resultButton}
          </div>
        ) : (
          <Fragment key={result.path}>{resultButton}</Fragment>
        );
      })}
    </Fragment>
  );
};
