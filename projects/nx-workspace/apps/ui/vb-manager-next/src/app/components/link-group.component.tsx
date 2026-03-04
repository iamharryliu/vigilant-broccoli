'use client';

import { Text, TextField, IconButton, Flex } from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { OPEN_TYPE, type OpenType } from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CardContainer } from './card-container.component';
import { DashboardIcon, ListBulletIcon } from '@radix-ui/react-icons';

interface LinkItem {
  label: string;
  target: string;
  type: OpenType;
  subgroup?: string;
}

interface LinkGroupProps {
  title: string;
  links: LinkItem[];
  alphabetical?: boolean;
  alphabeticalSubgroups?: boolean;
  grouped?: boolean;
  onGroupedChange?: (grouped: boolean) => void;
}

// Fuzzy search: checks if all characters from query appear in target string in order
const fuzzyMatch = (query: string, target: string): boolean => {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  let queryIndex = 0;
  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
};

export function LinkGroupComponent({
  title,
  links,
  alphabetical = true,
  alphabeticalSubgroups = true,
  grouped = true,
  onGroupedChange,
}: LinkGroupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGrouped, setIsGrouped] = useState(grouped);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  const handleGroupedToggle = () => {
    const newValue = !isGrouped;
    setIsGrouped(newValue);
    onGroupedChange?.(newValue);
  };

  // Filter links based on fuzzy search
  const filteredLinks = searchQuery
    ? links.filter(link => fuzzyMatch(searchQuery, link.label))
    : links;

  const subgroupOrder: string[] = [];
  filteredLinks.forEach(link => {
    if (link.subgroup && !subgroupOrder.includes(link.subgroup)) {
      subgroupOrder.push(link.subgroup);
    }
  });

  const sortedLinks = alphabetical
    ? [...filteredLinks].sort((a, b) => a.label.localeCompare(b.label))
    : filteredLinks;

  const itemsWithoutSubgroup = sortedLinks.filter(link => !link.subgroup);
  const itemsWithSubgroup = sortedLinks.filter(link => link.subgroup);

  const subgroups = itemsWithSubgroup.reduce((acc, link) => {
    const group = link.subgroup!;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  const subgroupEntries = alphabeticalSubgroups
    ? Object.entries(subgroups).sort(([a], [b]) => a.localeCompare(b))
    : subgroupOrder.map(key => [key, subgroups[key]] as [string, LinkItem[]]);

  const handleShellExecute = async (type: OpenType, target: string) => {
    try {
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
    } catch (error) {
      console.error('Error executing shell command:', error);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    moveFocusByDirection(e.currentTarget as HTMLElement, direction);
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

  const renderLink = (link: LinkItem) => {
    const baseClass = 'inline-flex justify-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium w-fit transition-[transform,background-color] duration-150 ease-out focus-visible:scale-110';

    if (
      link.type === OPEN_TYPE.MAC_APPLICATION ||
      link.type === OPEN_TYPE.VSCODE ||
      link.type === OPEN_TYPE.FILE_SYSTEM
    ) {
      return (
        <button
          key={link.target}
          onClick={() => handleShellExecute(link.type, link.target)}
          className={`${baseClass} cursor-pointer`}
          onKeyDown={handleLinkKeyDown}
          data-quick-link-item="true"
        >
          {link.label}
        </button>
      );
    }

    if (link.type === OPEN_TYPE.INTERNAL) {
      return (
        <a
          key={link.target}
          href={link.target}
          className={baseClass}
          onKeyDown={handleLinkKeyDown}
          data-quick-link-item="true"
        >
          {link.label}
        </a>
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

  return (
    <CardContainer
      title={title}
      gap="3"
      headerAction={
        <Flex gap="2" align="center">
          <IconButton
            size="1"
            variant="soft"
            onClick={handleGroupedToggle}
            title={isGrouped ? 'Show ungrouped' : 'Show grouped'}
          >
            {isGrouped ? <ListBulletIcon /> : <DashboardIcon />}
          </IconButton>
          <TextField.Root
            ref={searchInputRef}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            size="1"
            style={{ width: '150px' }}
          />
        </Flex>
      }
    >
      <div ref={contentRef}>
        {isGrouped ? (
          <div className="flex flex-col gap-4">
            {itemsWithoutSubgroup.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {itemsWithoutSubgroup.map((link) => renderLink(link))}
              </div>
            )}

            {subgroupEntries.map(([subgroupName, subgroupLinks]) => (
              <div key={subgroupName}>
                <Text size="3" weight="medium" className="mb-2">
                  {subgroupName}
                </Text>
                <div className="flex flex-wrap gap-2">
                  {subgroupLinks.map((link) => renderLink(link))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedLinks.map((link) => renderLink(link))}
          </div>
        )}
      </div>

      {filteredLinks.length === 0 && searchQuery && (
        <Text size="2" color="gray">
          No links found matching &quot;{searchQuery}&quot;
        </Text>
      )}
    </CardContainer>
  );
}
