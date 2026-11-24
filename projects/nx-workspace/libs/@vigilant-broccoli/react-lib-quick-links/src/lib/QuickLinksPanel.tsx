'use client';

import {
  OPEN_TYPE,
  type OpenType,
  type QuickLink,
} from '@vigilant-broccoli/common-js';
import {
  EntryDirectory,
  ENTRY_DIRECTORY_VIEW,
  type EntryDirectoryGroup,
  type EntryDirectoryItem,
  type EntryDirectoryView,
} from '@vigilant-broccoli/entry-directory';
import {
  WINDOW_OPEN_FEATURES,
  type EllipsisAction,
} from '@vigilant-broccoli/react-lib';
import { useQuickLinkFavorites } from './useQuickLinkFavorites';

export {
  ENTRY_DIRECTORY_VIEW as QUICK_LINKS_VIEW,
  type EntryDirectoryView as QuickLinksView,
};

const STORAGE_KEY = 'quick-links-view';
const SEARCH_PLACEHOLDER = 'Search...';
const WINDOW_TARGET_BLANK = '_blank';

export type ShellExecuteHandler = (
  type: OpenType,
  target: string,
  args?: string,
) => void | Promise<void>;

export type QuickLinksPanelProps = {
  links: QuickLink[];
  onShellExecute?: ShellExecuteHandler;
  autoFocusSearch?: boolean;
  onLinkOpen?: () => void;
  onEmbedOpen?: (link: QuickLink) => void;
  /** Navigates app routes (OPEN_TYPE.INTERNAL) in the current tab instead of opening a new one. */
  onInternalOpen?: (path: string) => void;
  canEmbed?: () => boolean;
  defaultView?: EntryDirectoryView;
  /** Keeps the input order of links and subgroups instead of sorting them alphabetically. */
  preserveOrder?: boolean;
  /** Adds browser-local favorite controls and a Favorites group. */
  enableFavorites?: boolean;
  /** Rows get an ellipsis menu with these actions (e.g. edit, delete) in place of the open button. */
  getMenuActions?: (link: QuickLink) => EllipsisAction[];
};

const NON_BROWSER_TYPES = [
  OPEN_TYPE.MAC_APPLICATION,
  OPEN_TYPE.VSCODE,
  OPEN_TYPE.FILE_SYSTEM,
] as const;

const isShellLink = (link: QuickLink) =>
  NON_BROWSER_TYPES.includes(link.type as (typeof NON_BROWSER_TYPES)[number]);

const toGroups = (
  entriesWithSubgroup: { link: QuickLink; entry: EntryDirectoryItem }[],
  preserveOrder: boolean,
): EntryDirectoryGroup[] => {
  const bySubgroup = new Map<string, EntryDirectoryItem[]>();
  for (const { link, entry } of entriesWithSubgroup) {
    const name = link.subgroup ?? '';
    bySubgroup.set(name, [...(bySubgroup.get(name) ?? []), entry]);
  }
  const subgroups = [...bySubgroup.entries()];
  if (!preserveOrder) subgroups.sort(([a], [b]) => a.localeCompare(b));
  return subgroups.map(([name, entries]) => ({ name, entries }));
};

export function QuickLinksPanel({
  links,
  onShellExecute,
  autoFocusSearch = false,
  onLinkOpen,
  onEmbedOpen,
  onInternalOpen,
  canEmbed,
  defaultView = ENTRY_DIRECTORY_VIEW.GROUPED,
  preserveOrder = false,
  enableFavorites = false,
  getMenuActions,
}: QuickLinksPanelProps) {
  const { favorites, toggleFavorite } = useQuickLinkFavorites(enableFavorites);
  const toEntry = (link: QuickLink): EntryDirectoryItem => {
    const favoriteId = JSON.stringify([
      link.label,
      link.target,
      link.type,
      link.args ?? '',
      link.subgroup ?? '',
      link.embed ?? false,
    ]);
    return {
      label: link.label,
      value: link.target,
      isExternal: !isShellLink(link),
      isFavorite: favorites.has(favoriteId),
      onFavoriteToggle: enableFavorites
        ? () => toggleFavorite(favoriteId)
        : undefined,
      menuActions: getMenuActions?.(link),
      onOpen: () => {
        if (isShellLink(link)) {
          onShellExecute?.(link.type, link.target, link.args);
        } else if (link.type === OPEN_TYPE.INTERNAL && onInternalOpen) {
          onInternalOpen(link.target);
        } else if (link.embed && onEmbedOpen && canEmbed?.()) {
          onEmbedOpen(link);
        } else {
          window.open(link.target, WINDOW_TARGET_BLANK, WINDOW_OPEN_FEATURES);
        }
      },
    };
  };

  const orderedLinks = preserveOrder
    ? links
    : [...links].sort((a, b) => a.label.localeCompare(b.label));
  const groupedLinks = toGroups(
    orderedLinks.map(link => ({ link, entry: toEntry(link) })),
    preserveOrder,
  );
  const favoriteEntries = groupedLinks.flatMap(group =>
    group.entries.filter(entry => entry.isFavorite),
  );
  const groups = [
    ...(favoriteEntries.length > 0
      ? [{ name: 'Favorites', isFavorites: true, entries: favoriteEntries }]
      : []),
    ...groupedLinks
      .map(group => ({
        ...group,
        entries: group.entries.filter(entry => !entry.isFavorite),
      }))
      .filter(group => group.entries.length > 0),
  ];

  return (
    <EntryDirectory
      groups={groups}
      searchPlaceholder={SEARCH_PLACEHOLDER}
      defaultView={defaultView}
      storageKey={STORAGE_KEY}
      onEntryOpen={onLinkOpen}
      autoFocusSearch={autoFocusSearch}
    />
  );
}
