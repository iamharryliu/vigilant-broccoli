'use client';

import {
  OPEN_TYPE,
  type OpenType,
  type QuickLink,
} from '@vigilant-broccoli/common-js';
import {
  SearchableList,
  SEARCHABLE_LIST_VIEW,
  type SearchableListGroup,
  type SearchableListItem,
  type SearchableListView,
} from './SearchableList';
import { WINDOW_OPEN_FEATURES } from '@vigilant-broccoli/react-lib';

export {
  SEARCHABLE_LIST_VIEW as QUICK_LINKS_VIEW,
  type SearchableListView as QuickLinksView,
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
  canEmbed?: () => boolean;
  defaultView?: SearchableListView;
  /** Keeps the input order of links and subgroups instead of sorting them alphabetically. */
  preserveOrder?: boolean;
};

const NON_BROWSER_TYPES = [
  OPEN_TYPE.MAC_APPLICATION,
  OPEN_TYPE.VSCODE,
  OPEN_TYPE.FILE_SYSTEM,
] as const;

const isShellLink = (link: QuickLink) =>
  NON_BROWSER_TYPES.includes(link.type as (typeof NON_BROWSER_TYPES)[number]);

const toGroups = (
  entriesWithSubgroup: { link: QuickLink; entry: SearchableListItem }[],
  preserveOrder: boolean,
): SearchableListGroup[] => {
  const bySubgroup = new Map<string, SearchableListItem[]>();
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
  canEmbed,
  defaultView = SEARCHABLE_LIST_VIEW.GROUPED,
  preserveOrder = false,
}: QuickLinksPanelProps) {
  const toEntry = (link: QuickLink): SearchableListItem => ({
    label: link.label,
    value: link.target,
    isExternal: !isShellLink(link),
    onOpen: () => {
      if (isShellLink(link)) {
        onShellExecute?.(link.type, link.target, link.args);
      } else if (link.embed && onEmbedOpen && canEmbed?.()) {
        onEmbedOpen(link);
      } else {
        window.open(link.target, WINDOW_TARGET_BLANK, WINDOW_OPEN_FEATURES);
      }
    },
  });

  const orderedLinks = preserveOrder
    ? links
    : [...links].sort((a, b) => a.label.localeCompare(b.label));
  const groups = toGroups(
    orderedLinks.map(link => ({ link, entry: toEntry(link) })),
    preserveOrder,
  );

  return (
    <SearchableList
      groups={groups}
      searchPlaceholder={SEARCH_PLACEHOLDER}
      defaultView={defaultView}
      storageKey={STORAGE_KEY}
      onEntryOpen={onLinkOpen}
      autoFocusSearch={autoFocusSearch}
    />
  );
}
