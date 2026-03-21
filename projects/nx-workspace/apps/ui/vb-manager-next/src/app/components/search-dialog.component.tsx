'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, IconButton, TextField, Text, Flex } from '@radix-ui/themes';
import {
  MagnifyingGlassIcon,
  DashboardIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons';
import { QUICK_LINKS } from '../constants/quick-links';
import { OPEN_TYPE, type OpenType } from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  moveQuickLinkFocusByDirection,
  type Direction,
} from '../utils/focus-navigation.utils';

const LOCAL_STORAGE_KEY = 'quick-links-grouped-state';

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

type SearchDialogComponentProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const NON_BROWSER_TYPES = [
  OPEN_TYPE.MAC_APPLICATION,
  OPEN_TYPE.VSCODE,
  OPEN_TYPE.FILE_SYSTEM,
] as const;

const getGroupedLinks = (links: (typeof QUICK_LINKS)[0][]) => {
  const itemsWithoutSubgroup = links.filter(link => !link.subgroup);
  const itemsWithSubgroup = links.filter(link => link.subgroup);

  const subgroups = itemsWithSubgroup.reduce((acc, link) => {
    const group = link.subgroup;
    if (group && !acc[group]) {
      acc[group] = [];
    }
    if (group) {
      acc[group].push(link);
    }
    return acc;
  }, {} as Record<string, typeof QUICK_LINKS>);

  const subgroupEntries = Object.entries(subgroups).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return { itemsWithoutSubgroup, subgroupEntries };
};

const openLink = (
  link: (typeof QUICK_LINKS)[0],
  handleShellExecute: (type: OpenType, target: string) => Promise<void>,
) => {
  if (
    NON_BROWSER_TYPES.includes(link.type as (typeof NON_BROWSER_TYPES)[number])
  ) {
    handleShellExecute(link.type, link.target);
  } else {
    window.open(link.target, '_blank', 'noopener,noreferrer');
  }
};

export function SearchDialogComponent({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: SearchDialogComponentProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const open = externalOpen ?? internalOpen;
  const setOpen = externalOnOpenChange ?? setInternalOpen;
  const [isGrouped, setIsGrouped] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState !== null) {
      setIsGrouped(savedState === 'true');
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

  const filteredAndScoredLinks = searchQuery
    ? QUICK_LINKS.map(link => {
        const result = fuzzyMatch(searchQuery, link.label);
        return { link, result };
      })
        .filter(({ result }) => result.matched)
        .sort((a, b) => b.result.score - a.result.score)
        .map(({ link }) => link)
    : QUICK_LINKS;

  const filteredLinks = filteredAndScoredLinks;
  const hasNoResults =
    filteredLinks.length === 0 && searchQuery.trim().length > 0;

  const sortedLinks = searchQuery
    ? filteredLinks
    : [...filteredLinks].sort((a, b) => a.label.localeCompare(b.label));

  const { itemsWithoutSubgroup, subgroupEntries } =
    getGroupedLinks(sortedLinks);

  const handleShellExecute = async (type: OpenType, target: string) => {
    const response = await fetch(API_ENDPOINTS.SHELL_EXECUTE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, target }),
    });

    if (!response.ok) {
      console.error('Failed to execute shell command');
    }
  };

  const handleFirstLinkAction = () => {
    if (filteredLinks.length === 0) return;
    openLink(sortedLinks[0], handleShellExecute);
    setOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFirstLinkAction();
      return;
    }

    if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowLeft'
    ) {
      e.preventDefault();
      const direction =
        e.key === 'ArrowDown'
          ? 'down'
          : e.key === 'ArrowUp'
          ? 'up'
          : e.key === 'ArrowRight'
          ? 'right'
          : 'left';
      moveQuickLinkFocusByDirection({
        contentRoot: contentRef.current,
        searchInput: searchInputRef.current,
        currentElement: e.currentTarget as HTMLElement,
        direction,
      });
    }
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.click();
      return;
    }

    if (
      e.key !== 'ArrowDown' &&
      e.key !== 'ArrowUp' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'ArrowLeft'
    ) {
      return;
    }

    e.preventDefault();
    const direction: Direction =
      e.key === 'ArrowDown'
        ? 'down'
        : e.key === 'ArrowUp'
        ? 'up'
        : e.key === 'ArrowRight'
        ? 'right'
        : 'left';
    moveQuickLinkFocusByDirection({
      contentRoot: contentRef.current,
      searchInput: searchInputRef.current,
      currentElement: e.currentTarget,
      direction,
    });
  };

  const renderLink = (link: (typeof QUICK_LINKS)[0], index: number) => {
    const baseClass =
      'inline-flex justify-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium w-fit transition-[transform,background-color] duration-150 ease-out focus-visible:scale-110';
    const uniqueKey = `${link.label}-${link.target}-${index}`;

    if (
      NON_BROWSER_TYPES.includes(
        link.type as (typeof NON_BROWSER_TYPES)[number],
      )
    ) {
      return (
        <button
          key={uniqueKey}
          onClick={() => handleShellExecute(link.type, link.target)}
          onKeyDown={handleLinkKeyDown}
          className={`${baseClass} cursor-pointer`}
          data-quick-link-item="true"
        >
          {link.label}
        </button>
      );
    }

    return (
      <a
        key={uniqueKey}
        href={link.target}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        onKeyDown={handleLinkKeyDown}
        data-quick-link-item="true"
      >
        {link.label}
      </a>
    );
  };

  const renderGroupedLinks = () => (
    <>
      {itemsWithoutSubgroup.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {itemsWithoutSubgroup.map((link, index) => renderLink(link, index))}
        </div>
      )}

      {subgroupEntries.map(([subgroupName, subgroupLinks]) => (
        <div key={subgroupName}>
          <Text size="3" weight="medium" className="mb-2">
            {subgroupName}
          </Text>
          <div className="flex flex-wrap gap-2">
            {subgroupLinks.map((link, index) => renderLink(link, index))}
          </div>
        </div>
      ))}
    </>
  );

  const renderContent = () =>
    isGrouped ? (
      renderGroupedLinks()
    ) : (
      <div className="flex flex-wrap gap-2">
        {sortedLinks.map((link, index) => renderLink(link, index))}
      </div>
    );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <Dialog.Trigger>
          <IconButton variant="soft" size="2" aria-label="Search Quick Links">
            <MagnifyingGlassIcon />
          </IconButton>
        </Dialog.Trigger>
      )}

      <Dialog.Content
        style={{
          maxWidth: 800,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div>
          <Dialog.Title>Quick Links</Dialog.Title>

          <Flex gap="2" align="center" mb="4">
            <TextField.Root
              ref={searchInputRef}
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              size="2"
              style={{ flex: 1 }}
            />
            <IconButton
              size="2"
              variant="soft"
              onClick={() => setIsGrouped(!isGrouped)}
              title={isGrouped ? 'Show ungrouped' : 'Show grouped'}
            >
              {isGrouped ? <ListBulletIcon /> : <DashboardIcon />}
            </IconButton>
          </Flex>
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
