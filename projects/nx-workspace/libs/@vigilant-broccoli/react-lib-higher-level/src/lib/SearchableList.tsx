'use client';

import { useEffect, useRef, useState } from 'react';
import { LayoutList, List, Rows3, type LucideIcon } from 'lucide-react';
import {
  Button,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  WINDOW_OPEN_FEATURES,
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
  <div
    tabIndex={0}
    {...{ [QUICK_LINK_ITEM_ATTR]: 'true' }}
    onKeyDown={onKeyDown}
    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring dark:border-border"
  >
    <div className="min-w-0 flex-1">
      <Text as="div" size="2" weight="medium">
        {entry.label}
      </Text>
      <Text
        as="div"
        size="1"
        color="gray"
        className="truncate font-mono"
        title={entry.value}
      >
        {entry.value}
      </Text>
    </div>
    {(entry.onOpen || isUrl(entry.value)) && (
      <IconButton variant="ghost" icon="external-link" onClick={onActivate} />
    )}
    <CopyButton text={entry.value} />
  </div>
);

export const SearchableList = ({
  groups,
  searchPlaceholder = SEARCH_PLACEHOLDER,
  defaultView = SEARCHABLE_LIST_VIEW.ROWS,
  storageKey,
  onEntryOpen,
  autoFocusSearch = false,
}: {
  groups: SearchableListGroup[];
  searchPlaceholder?: string;
  defaultView?: SearchableListView;
  /** Persists the chosen view in localStorage under this key. */
  storageKey?: string;
  onEntryOpen?: () => void;
  autoFocusSearch?: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<SearchableListView>(defaultView);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!storageKey) return;
    const savedView = localStorage.getItem(storageKey);
    if (isSearchableListView(savedView)) setView(savedView);
  }, [storageKey]);

  useEffect(() => {
    if (autoFocusSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [autoFocusSearch]);

  const handleViewChange = (nextView: SearchableListView) => {
    setView(nextView);
    if (storageKey) localStorage.setItem(storageKey, nextView);
  };

  const query = searchQuery.trim();
  const searched = searchGroups(groups, query);
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

  const handleRowKeyDown =
    (entry: SearchableListItem) => (e: React.KeyboardEvent<HTMLElement>) => {
      // Ignore keys bubbling from the row's inner copy/open buttons.
      if (e.target !== e.currentTarget) return;
      if (e.key === ENTER_KEY) {
        e.preventDefault();
        activate(entry);
        return;
      }
      moveFocus(e);
    };

  const toButtonConfig = (entry: SearchableListItem): ButtonConfig => ({
    label: entry.label,
    onClick: () => activate(entry),
    isExternal: entry.isExternal ?? (!entry.onOpen && isUrl(entry.value)),
  });

  const renderButtons = (items: SearchableListItem[]) => (
    <ButtonList
      buttons={items.map(toButtonConfig)}
      navigationRootRef={contentRef}
      searchInputRef={searchInputRef}
    />
  );

  const renderGroup = (group: (typeof searched)[number], index: number) => {
    const items = group.scored.map(({ entry }) => entry);
    return (
      <div key={`${group.name}-${index}`} className="flex flex-col gap-2">
        {group.name && (
          <Text size="3" weight="medium">
            {group.name}
          </Text>
        )}
        {view === SEARCHABLE_LIST_VIEW.ROWS
          ? items.map((entry, entryIndex) => (
              <SearchableListRow
                key={`${entry.label}-${entryIndex}`}
                entry={entry}
                onActivate={() => activate(entry)}
                onKeyDown={handleRowKeyDown(entry)}
              />
            ))
          : renderButtons(items)}
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
        <TooltipProvider delayDuration={0}>
          <div
            role="group"
            aria-label={VIEW_TOGGLE_LABEL}
            className="flex gap-1"
          >
            {VIEW_OPTIONS.map(({ value, label, description, Icon }) => (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant={view === value ? 'default' : 'outline'}
                    aria-label={label}
                    aria-pressed={view === value}
                    onClick={() => handleViewChange(value)}
                  >
                    <Icon size={VIEW_ICON_SIZE} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{description}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {entries.length === 0 ? (
        <Text size="2" color="gray">
          {EMPTY_MESSAGE}
        </Text>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div ref={contentRef} className="flex flex-col gap-4 py-3">
            {view === SEARCHABLE_LIST_VIEW.LIST
              ? renderButtons(entries)
              : searched.map(renderGroup)}
          </div>
        </div>
      )}
    </div>
  );
};
