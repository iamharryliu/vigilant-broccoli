'use client';

import { useEffect, useRef, useState } from 'react';
import { LayoutList, List, Rows3, Star, type LucideIcon } from 'lucide-react';
import {
  type ButtonConfig,
  ButtonList,
  CopyButton,
  type Direction,
  fuzzyMatch,
  IconButton,
  Input,
  moveQuickLinkFocusByDirection,
  QUICK_LINK_ITEM_ATTR,
  Text,
  Tabs,
  TabsList,
  TabsTrigger,
  WINDOW_OPEN_FEATURES,
  Button,
} from '@vigilant-broccoli/react-lib';

export const SEARCHABLE_LIST_VIEW = {
  ROWS: 'rows',
  GROUPED: 'grouped',
  LIST: 'list',
} as const;

export type SearchableListView =
  (typeof SEARCHABLE_LIST_VIEW)[keyof typeof SEARCHABLE_LIST_VIEW];

export type SearchableListItem = {
  label: string;
  value: string;
  onOpen?: () => void;
  isExternal?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
};

export type SearchableListGroup = {
  /** An empty name renders the entries without a heading. */
  name: string;
  entries: SearchableListItem[];
};

const SEARCH_PLACEHOLDER = 'Search...';
const EMPTY_MESSAGE = 'No entries found.';
const VIEW_TOGGLE_LABEL = 'View';
const WINDOW_TARGET_BLANK = '_blank';
const URL_PREFIX = 'http';
const ENTER_KEY = 'Enter';

const VIEW_OPTIONS: {
  value: SearchableListView;
  label: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    value: SEARCHABLE_LIST_VIEW.LIST,
    label: 'List',
    description: 'List: all entries as badges',
    Icon: List,
  },
  {
    value: SEARCHABLE_LIST_VIEW.GROUPED,
    label: 'Grouped',
    description: 'Grouped: badges under group titles',
    Icon: LayoutList,
  },
  {
    value: SEARCHABLE_LIST_VIEW.ROWS,
    label: 'Rows',
    description: 'Rows: detailed rows with open and copy buttons',
    Icon: Rows3,
  },
];

const VIEW_ICON_SIZE = 16;
const FAVORITES_LABEL = 'Favorites';
const ADD_FAVORITE_LABEL = (label: string) => `Add ${label} to favorites`;
const REMOVE_FAVORITE_LABEL = (label: string) =>
  `Remove ${label} from favorites`;

const ARROW_DIRECTION: Record<string, Direction> = {
  ArrowDown: 'down',
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowLeft: 'left',
};

const isUrl = (value: string) => value.startsWith(URL_PREFIX);

const isSearchableListView = (
  value: string | null,
): value is SearchableListView =>
  VIEW_OPTIONS.some(option => option.value === value);

const openUrl = (url: string) =>
  window.open(url, WINDOW_TARGET_BLANK, WINDOW_OPEN_FEATURES);

type ScoredEntry = { entry: SearchableListItem; score: number };

const scoreEntry = (entry: SearchableListItem, query: string) => {
  const labelMatch = fuzzyMatch(query, entry.label);
  if (labelMatch.matched) return labelMatch.score;
  return entry.value.toLowerCase().includes(query.toLowerCase()) ? 0 : null;
};

const searchGroups = (groups: SearchableListGroup[], query: string) => {
  if (!query) {
    return groups.map(group => ({
      name: group.name,
      scored: group.entries.map<ScoredEntry>(entry => ({ entry, score: 0 })),
    }));
  }
  return groups
    .map(group => ({
      name: group.name,
      scored: group.entries
        .flatMap<ScoredEntry>(entry => {
          const score = scoreEntry(entry, query);
          return score === null ? [] : [{ entry, score }];
        })
        .sort((a, b) => b.score - a.score),
    }))
    .filter(group => group.scored.length > 0)
    .sort((a, b) => b.scored[0].score - a.scored[0].score);
};

const SearchableListRow = ({
  entry,
  onActivate,
  onKeyDown,
}: {
  entry: SearchableListItem;
  onActivate: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}) => (
  <li className="flex min-h-11 items-center bg-card text-card-foreground [&_button]:min-h-11 [&_button]:shrink-0 [&_button]:focus-visible:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-inset [&_button]:focus-visible:ring-ring [&_button]:active:bg-muted">
    <button
      type="button"
      {...{ [QUICK_LINK_ITEM_ATTR]: 'true' }}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      className="flex min-w-0 flex-1 flex-col justify-center px-3 py-1.5 text-left transition-colors hover:bg-accent active:bg-muted"
    >
      <span className="w-full truncate text-sm font-medium" title={entry.label}>
        {entry.label}
      </span>
      <span
        className="w-full truncate font-mono text-xs text-muted-foreground"
        title={entry.value}
      >
        {entry.value}
      </span>
    </button>
    <div className="flex shrink-0 items-center pr-1 [&_button]:min-w-11">
      {entry.onFavoriteToggle && <FavoriteButton entry={entry} />}
      {(entry.onOpen || isUrl(entry.value)) && (
        <IconButton variant="ghost" icon="external-link" onClick={onActivate} />
      )}
      <CopyButton text={entry.value} />
    </div>
  </li>
);

const FavoriteButton = ({ entry }: { entry: SearchableListItem }) => {
  const accessibleLabel = entry.isFavorite
    ? REMOVE_FAVORITE_LABEL(entry.label)
    : ADD_FAVORITE_LABEL(entry.label);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={accessibleLabel}
      aria-pressed={entry.isFavorite ?? false}
      title={accessibleLabel}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        entry.onFavoriteToggle?.();
      }}
      className="min-h-11 min-w-11 shrink-0"
    >
      <Star
        size={16}
        aria-hidden="true"
        fill={entry.isFavorite ? 'currentColor' : 'none'}
      />
    </Button>
  );
};

export const SearchableList = ({
  groups,
  searchPlaceholder = SEARCH_PLACEHOLDER,
  defaultView = SEARCHABLE_LIST_VIEW.ROWS,
  storageKey,
  onEntryOpen,
  autoFocusSearch = false,
  enableFavorites = false,
}: {
  groups: SearchableListGroup[];
  searchPlaceholder?: string;
  defaultView?: SearchableListView;
  /** Persists the chosen view in localStorage under this key. */
  storageKey?: string;
  onEntryOpen?: () => void;
  autoFocusSearch?: boolean;
  enableFavorites?: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<SearchableListView>(defaultView);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const savedView = localStorage.getItem(storageKey);
      if (isSearchableListView(savedView)) setView(savedView);
    } catch {
      // Keep the default view when browser storage is unavailable.
    }
  }, [storageKey]);

  useEffect(() => {
    if (autoFocusSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [autoFocusSearch]);

  const handleViewChange = (nextView: SearchableListView) => {
    setView(nextView);
    try {
      if (storageKey) localStorage.setItem(storageKey, nextView);
    } catch {
      // View changes still work without persistence.
    }
  };

  const query = searchQuery.trim();
  const visibleGroups = favoritesOnly
    ? groups
        .map(group => ({
          ...group,
          entries: group.entries.filter(entry => entry.isFavorite),
        }))
        .filter(group => group.entries.length > 0)
    : groups;
  const searched = searchGroups(visibleGroups, query);
  const entries = searched.flatMap(group => group.scored.map(s => s.entry));
  const bestEntry = searched
    .flatMap(group => group.scored)
    .reduce<ScoredEntry | null>(
      (best, current) => (!best || current.score > best.score ? current : best),
      null,
    )?.entry;

  const activate = (entry: SearchableListItem) => {
    if (entry.onOpen) {
      entry.onOpen();
    } else if (isUrl(entry.value)) {
      openUrl(entry.value);
    } else {
      void navigator.clipboard.writeText(entry.value);
    }
    onEntryOpen?.();
  };

  const moveFocus = (e: React.KeyboardEvent<HTMLElement>) => {
    const direction = ARROW_DIRECTION[e.key];
    if (!direction) return false;
    e.preventDefault();
    moveQuickLinkFocusByDirection({
      contentRoot: contentRef.current,
      searchInput: searchInputRef.current,
      currentElement: e.currentTarget,
      direction,
    });
    return true;
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ENTER_KEY) {
      e.preventDefault();
      if (!bestEntry) return;
      activate(bestEntry);
      setSearchQuery('');
      return;
    }
    moveFocus(e);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    moveFocus(e);
  };

  const toButtonConfig = (entry: SearchableListItem): ButtonConfig => ({
    label: entry.label,
    onClick: () => activate(entry),
    isExternal: entry.isExternal ?? (!entry.onOpen && isUrl(entry.value)),
  });

  const renderButtons = (items: SearchableListItem[]) =>
    items.some(entry => entry.onFavoriteToggle) ? (
      <div className="flex flex-wrap gap-2">
        {items.map((entry, index) => (
          <div
            className="inline-flex items-center gap-1"
            key={`${entry.label}-${index}`}
          >
            <ButtonList
              buttons={[toButtonConfig(entry)]}
              navigationRootRef={contentRef}
              searchInputRef={searchInputRef}
            />
            {entry.onFavoriteToggle && <FavoriteButton entry={entry} />}
          </div>
        ))}
      </div>
    ) : (
      <ButtonList
        buttons={items.map(toButtonConfig)}
        navigationRootRef={contentRef}
        searchInputRef={searchInputRef}
      />
    );

  const renderGroup = (group: (typeof searched)[number], index: number) => {
    const items = group.scored.map(({ entry }) => entry);
    const isRows = view === SEARCHABLE_LIST_VIEW.ROWS;
    return (
      <div
        key={`${group.name}-${index}`}
        className={`flex flex-col ${isRows ? 'gap-1' : 'gap-2'}`}
      >
        {group.name &&
          (isRows ? (
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.name}
            </h2>
          ) : (
            <Text size="3" weight="medium">
              {group.name}
            </Text>
          ))}
        {isRows ? (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {items.map((entry, entryIndex) => (
              <SearchableListRow
                key={`${entry.label}-${entryIndex}`}
                entry={entry}
                onActivate={() => activate(entry)}
                onKeyDown={handleRowKeyDown}
              />
            ))}
          </ul>
        ) : (
          renderButtons(items)
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          ref={searchInputRef}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="flex-1"
        />
        {enableFavorites && (
          <Button
            type="button"
            variant={favoritesOnly ? 'default' : 'outline'}
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly(value => !value)}
            className="min-h-11 shrink-0"
          >
            <Star size={16} aria-hidden="true" />
            {FAVORITES_LABEL}
          </Button>
        )}
        <Tabs
          value={view}
          onValueChange={next => handleViewChange(next as SearchableListView)}
        >
          <TabsList aria-label={VIEW_TOGGLE_LABEL} className="h-11">
            {VIEW_OPTIONS.map(({ value, label, description, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                aria-label={label}
                title={description}
                className="px-2"
              >
                <Icon size={VIEW_ICON_SIZE} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {entries.length === 0 ? (
        <Text size="2" color="gray">
          {EMPTY_MESSAGE}
        </Text>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div
            ref={contentRef}
            className={`flex flex-col py-3 ${view === SEARCHABLE_LIST_VIEW.ROWS ? 'gap-3' : 'gap-4'}`}
          >
            {view === SEARCHABLE_LIST_VIEW.LIST
              ? renderButtons(entries)
              : searched.map(renderGroup)}
          </div>
        </div>
      )}
    </div>
  );
};
