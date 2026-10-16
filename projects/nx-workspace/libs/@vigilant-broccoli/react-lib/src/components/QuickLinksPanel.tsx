'use client';

import {
  OPEN_TYPE,
  type OpenType,
  type QuickLink,
} from '@vigilant-broccoli/common-js';
import {
  Pastebin,
  PASTEBIN_VIEW,
  type PastebinItem,
  type PastebinItemGroup,
  type PastebinView,
} from './Pastebin';
import { WINDOW_OPEN_FEATURES } from '../utils/browser.utils';

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
  defaultView?: PastebinView;
};

const NON_BROWSER_TYPES = [
  OPEN_TYPE.MAC_APPLICATION,
  OPEN_TYPE.VSCODE,
  OPEN_TYPE.FILE_SYSTEM,
] as const;

const isShellLink = (link: QuickLink) =>
  NON_BROWSER_TYPES.includes(link.type as (typeof NON_BROWSER_TYPES)[number]);

const toGroups = (
  entriesWithSubgroup: { link: QuickLink; entry: PastebinItem }[],
): PastebinItemGroup[] => {
  const bySubgroup = new Map<string, PastebinItem[]>();
  for (const { link, entry } of entriesWithSubgroup) {
    const name = link.subgroup ?? '';
    bySubgroup.set(name, [...(bySubgroup.get(name) ?? []), entry]);
  }
  return [...bySubgroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, entries]) => ({ name, entries }));
};

export function QuickLinksPanel({
  links,
  onShellExecute,
  autoFocusSearch = false,
  onLinkOpen,
  onEmbedOpen,
  canEmbed,
  defaultView = PASTEBIN_VIEW.GROUPED,
}: QuickLinksPanelProps) {
  const toEntry = (link: QuickLink): PastebinItem => ({
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

  const groups = toGroups(
    [...links]
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(link => ({ link, entry: toEntry(link) })),
  );

  return (
    <Pastebin
      groups={groups}
      searchPlaceholder={SEARCH_PLACEHOLDER}
      defaultView={defaultView}
      storageKey={STORAGE_KEY}
      onEntryOpen={onLinkOpen}
      autoFocusSearch={autoFocusSearch}
    />
  );
}
