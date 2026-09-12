'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@radix-ui/themes';
import { DashboardIcon, ListBulletIcon } from '@radix-ui/react-icons';
import {
  OPEN_TYPE,
  type OpenType,
  type QuickLink,
} from '@vigilant-broccoli/common-js';
import { Button } from './Button';
import { ButtonList, ButtonConfig } from './ButtonList';
import { Input } from './Input';
import { Text } from './Text';
import {
  moveQuickLinkFocusByDirection,
  type Direction,
} from '../utils/focus-navigation.utils';
import { WINDOW_OPEN_FEATURES } from '../utils/browser.utils';

const LOCAL_STORAGE_KEY = 'quick-links-grouped-state';
const DIALOG_TITLE = 'Quick Links';
const DIALOG_MAX_WIDTH = 800;
const SEARCH_PLACEHOLDER = 'Search...';
const GROUP_TOGGLE_TITLE = {
  GROUPED: 'Show ungrouped',
  UNGROUPED: 'Show grouped',
} as const;
const WINDOW_TARGET_BLANK = '_blank';
const GROUPED_STATE_TRUE = 'true';

const ARROW_DIRECTION: Record<string, Direction> = {
  ArrowDown: 'down',
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowLeft: 'left',
};

type FuzzyMatchResult = {
  matched: boolean;
  score: number;
};

const fuzzyMatch = (query: string, target: string): FuzzyMatchResult => {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  let queryIndex = 0;
  let score = 0;
  let previousMatchIndex = -1;

  for (
    let i = 0;
    i < targetLower.length && queryIndex < queryLower.length;
    i++
  ) {
    if (targetLower[i] === queryLower[queryIndex]) {
      const gap = previousMatchIndex === -1 ? i : i - previousMatchIndex - 1;
      const gapPenalty = gap * 0.1;
      const positionBonus = Math.max(0, 10 - i);
      score += 10 - gapPenalty + positionBonus;
      previousMatchIndex = i;
      queryIndex++;
    }
  }

  const matched = queryIndex === queryLower.length;

  if (matched) {
    if (targetLower.startsWith(queryLower)) {
      score += 50;
    } else if (targetLower.includes(' ' + queryLower)) {
      score += 30;
    }
  }

  return { matched, score };
};

export type ShellExecuteHandler = (
  type: OpenType,
  target: string,
  args?: string,
) => void | Promise<void>;

export type QuickLinksDialogProps = {
  links: QuickLink[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShellExecute?: ShellExecuteHandler;
};

const NON_BROWSER_TYPES = [
  OPEN_TYPE.MAC_APPLICATION,
  OPEN_TYPE.VSCODE,
  OPEN_TYPE.FILE_SYSTEM,
] as const;

const isShellLink = (link: QuickLink) =>
  NON_BROWSER_TYPES.includes(link.type as (typeof NON_BROWSER_TYPES)[number]);

const getGroupedLinks = (links: QuickLink[]) => {
  const itemsWithoutSubgroup = links.filter(link => !link.subgroup);
  const itemsWithSubgroup = links.filter(link => link.subgroup);

  const subgroups = itemsWithSubgroup.reduce(
    (acc, link) => {
      const group = link.subgroup;
      if (group && !acc[group]) {
        acc[group] = [];
      }
      if (group) {
        acc[group].push(link);
      }
      return acc;
    },
    {} as Record<string, QuickLink[]>,
  );

  const subgroupEntries = Object.entries(subgroups).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return { itemsWithoutSubgroup, subgroupEntries };
};

export function QuickLinksDialog({
  links,
  open,
  onOpenChange,
  onShellExecute,
}: QuickLinksDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGrouped, setIsGrouped] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState !== null) {
      setIsGrouped(savedState === GROUPED_STATE_TRUE);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, String(isGrouped));
  }, [isGrouped]);

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  const filteredLinks = searchQuery
    ? links
        .map(link => ({ link, result: fuzzyMatch(searchQuery, link.label) }))
        .filter(({ result }) => result.matched)
        .sort((a, b) => b.result.score - a.result.score)
        .map(({ link }) => link)
    : links;

  const hasNoResults =
    filteredLinks.length === 0 && searchQuery.trim().length > 0;

  const sortedLinks = searchQuery
    ? filteredLinks
    : [...filteredLinks].sort((a, b) => a.label.localeCompare(b.label));

  const { itemsWithoutSubgroup, subgroupEntries } =
    getGroupedLinks(sortedLinks);

  const openLink = (link: QuickLink) => {
    if (isShellLink(link)) {
      onShellExecute?.(link.type, link.target, link.args);
      return;
    }
    window.open(link.target, WINDOW_TARGET_BLANK, WINDOW_OPEN_FEATURES);
  };

  const handleFirstLinkAction = () => {
    if (sortedLinks.length === 0) return;
    openLink(sortedLinks[0]);
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFirstLinkAction();
      return;
    }

    const direction = ARROW_DIRECTION[e.key];
    if (!direction) return;

    e.preventDefault();
    moveQuickLinkFocusByDirection({
      contentRoot: contentRef.current,
      searchInput: searchInputRef.current,
      currentElement: e.currentTarget as HTMLElement,
      direction,
    });
  };

  const toLinkButtonConfig = (link: QuickLink): ButtonConfig => ({
    label: link.label,
    onClick: () => openLink(link),
    isExternal: !isShellLink(link),
  });

  const renderContent = () =>
    isGrouped ? (
      <>
        {itemsWithoutSubgroup.length > 0 && (
          <ButtonList buttons={itemsWithoutSubgroup.map(toLinkButtonConfig)} />
        )}
        {subgroupEntries.map(([subgroupName, subgroupLinks]) => (
          <div key={subgroupName}>
            <Text size="3" weight="medium" className="mb-2">
              {subgroupName}
            </Text>
            <ButtonList buttons={subgroupLinks.map(toLinkButtonConfig)} />
          </div>
        ))}
      </>
    ) : (
      <ButtonList buttons={sortedLinks.map(toLinkButtonConfig)} />
    );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{
          maxWidth: DIALOG_MAX_WIDTH,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div>
          <Dialog.Title>{DIALOG_TITLE}</Dialog.Title>

          <div className="flex gap-2 items-center mb-4">
            <Input
              ref={searchInputRef}
              placeholder={SEARCH_PLACEHOLDER}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setIsGrouped(!isGrouped)}
              title={
                isGrouped
                  ? GROUP_TOGGLE_TITLE.GROUPED
                  : GROUP_TOGGLE_TITLE.UNGROUPED
              }
            >
              {isGrouped ? <ListBulletIcon /> : <DashboardIcon />}
            </Button>
          </div>
        </div>

        {hasNoResults ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 0.5rem',
            }}
          >
            <div ref={contentRef} style={{ textAlign: 'center' }}>
              <Text size="2" color="gray">
                No links found matching &quot;{searchQuery}&quot;
              </Text>
            </div>
          </div>
        ) : (
          <div
            style={{
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <div
              ref={contentRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
              }}
            >
              {renderContent()}
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
