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

const LOCAL_STORAGE_KEY = 'quick-links-grouped-state';

const fuzzyMatch = (query: string, target: string): boolean => {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  let queryIndex = 0;
  for (
    let i = 0;
    i < targetLower.length && queryIndex < queryLower.length;
    i++
  ) {
    if (targetLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
};

type SearchDialogComponentProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);
  type Direction = 'up' | 'down' | 'left' | 'right';
  type FocusNode = { element: HTMLElement; centerX: number; centerY: number };
  const ROW_TOLERANCE = 14;

  const getFocusableLinks = (): HTMLElement[] => {
    if (!contentRef.current) return [];
    return Array.from(
      contentRef.current.querySelectorAll<HTMLElement>('[data-quick-link-item="true"]'),
    );
  };

  const buildLinkRows = (): FocusNode[][] => {
    const nodes = getFocusableLinks()
      .filter(
        node =>
          !node.hasAttribute('disabled') &&
          node.tabIndex !== -1 &&
          node.getClientRects().length > 0,
      )
      .map<FocusNode>(element => {
        const rect = element.getBoundingClientRect();
        return {
          element,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        };
      })
      .sort((a, b) => a.centerY - b.centerY || a.centerX - b.centerX);

    const rows: FocusNode[][] = [];
    for (const node of nodes) {
      const lastRow = rows[rows.length - 1];
      if (!lastRow) {
        rows.push([node]);
        continue;
      }

      const rowCenterY =
        lastRow.reduce((sum, item) => sum + item.centerY, 0) / lastRow.length;
      if (Math.abs(node.centerY - rowCenterY) <= ROW_TOLERANCE) {
        lastRow.push(node);
      } else {
        rows.push([node]);
      }
    }

    for (const row of rows) {
      row.sort((a, b) => a.centerX - b.centerX);
    }

    return rows;
  };

  const findClosestByX = (row: FocusNode[], x: number): FocusNode | null => {
    if (row.length === 0) return null;
    let best = row[0];
    let bestDistance = Math.abs(best.centerX - x);
    for (const node of row) {
      const distance = Math.abs(node.centerX - x);
      if (distance < bestDistance) {
        best = node;
        bestDistance = distance;
      }
    }
    return best;
  };

  const findNodePosition = (rows: FocusNode[][], element: HTMLElement) => {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const itemIndex = rows[rowIndex].findIndex(node => node.element === element);
      if (itemIndex !== -1) {
        return { rowIndex, itemIndex };
      }
    }
    return null;
  };

  const moveFocusByDirection = (
    currentElement: HTMLElement,
    direction: Direction,
  ) => {
    const rows = buildLinkRows();
    if (rows.length === 0) return;

    if (currentElement === searchInputRef.current) {
      const inputRect = currentElement.getBoundingClientRect();
      const inputCenterX = inputRect.left + inputRect.width / 2;
      if (direction === 'down' || direction === 'right') {
        findClosestByX(rows[0], inputCenterX)?.element.focus();
        return;
      }
      findClosestByX(rows[rows.length - 1], inputCenterX)?.element.focus();
      return;
    }

    const position = findNodePosition(rows, currentElement);
    if (!position) return;

    const { rowIndex, itemIndex } = position;
    const row = rows[rowIndex];
    const current = row[itemIndex];

    if (direction === 'right') {
      if (itemIndex < row.length - 1) {
        row[itemIndex + 1].element.focus();
      } else if (rowIndex < rows.length - 1) {
        rows[rowIndex + 1][0].element.focus();
      }
      return;
    }

    if (direction === 'left') {
      if (itemIndex > 0) {
        row[itemIndex - 1].element.focus();
      } else if (rowIndex > 0) {
        const prevRow = rows[rowIndex - 1];
        prevRow[prevRow.length - 1].element.focus();
      } else {
        searchInputRef.current?.focus();
      }
      return;
    }

    if (direction === 'down') {
      if (rowIndex < rows.length - 1) {
        findClosestByX(rows[rowIndex + 1], current.centerX)?.element.focus();
      }
      return;
    }

    if (rowIndex > 0) {
      findClosestByX(rows[rowIndex - 1], current.centerX)?.element.focus();
    } else {
      searchInputRef.current?.focus();
    }
  };

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

  useEffect(() => {
    if (!open) {
      setContentHeight(undefined);
      return;
    }

    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [open, searchQuery, isGrouped]);

  const filteredLinks = searchQuery
    ? QUICK_LINKS.filter(link => fuzzyMatch(searchQuery, link.label))
    : QUICK_LINKS;

  const sortedLinks = [...filteredLinks].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  const itemsWithoutSubgroup = sortedLinks.filter(link => !link.subgroup);
  const itemsWithSubgroup = sortedLinks.filter(link => link.subgroup);

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

    const firstLink = sortedLinks[0];
    const nonBrowserTypes = [
      OPEN_TYPE.MAC_APPLICATION,
      OPEN_TYPE.VSCODE,
      OPEN_TYPE.FILE_SYSTEM,
    ] as const;

    if (
      nonBrowserTypes.includes(
        firstLink.type as (typeof nonBrowserTypes)[number],
      )
    ) {
      handleShellExecute(firstLink.type, firstLink.target);
    } else {
      window.open(firstLink.target, '_blank', 'noopener,noreferrer');
    }

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
      moveFocusByDirection(e.currentTarget as HTMLElement, direction);
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
    moveFocusByDirection(e.currentTarget, direction);
  };

  const nonBrowserTypes = [
    OPEN_TYPE.MAC_APPLICATION,
    OPEN_TYPE.VSCODE,
    OPEN_TYPE.FILE_SYSTEM,
  ] as const;

  const renderLink = (link: (typeof QUICK_LINKS)[0]) => {
    const baseClass =
      'inline-flex justify-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium w-fit transition-[transform,background-color] duration-150 ease-out focus-visible:scale-110';

    if (
      nonBrowserTypes.includes(link.type as (typeof nonBrowserTypes)[number])
    ) {
      return (
        <button
          key={link.target}
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
        key={link.target}
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
          {itemsWithoutSubgroup.map(link => renderLink(link))}
        </div>
      )}

      {subgroupEntries.map(([subgroupName, subgroupLinks]) => (
        <div key={subgroupName}>
          <Text size="3" weight="medium" className="mb-2">
            {subgroupName}
          </Text>
          <div className="flex flex-wrap gap-2">
            {subgroupLinks.map(link => renderLink(link))}
          </div>
        </div>
      ))}
    </>
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
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
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

        <div
          style={{
            height: contentHeight,
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
          }}
        >
          <div
            ref={contentRef}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {isGrouped ? (
              renderGroupedLinks()
            ) : (
              <div className="flex flex-wrap gap-2">
                {sortedLinks.map(link => renderLink(link))}
              </div>
            )}

            {filteredLinks.length === 0 && searchQuery && (
              <Text size="2" color="gray">
                No links found matching &quot;{searchQuery}&quot;
              </Text>
            )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
