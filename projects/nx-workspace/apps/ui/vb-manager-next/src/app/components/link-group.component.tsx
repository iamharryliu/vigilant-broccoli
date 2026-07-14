'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { Text } from '@radix-ui/themes';
import {
  Button,
  ButtonList,
  ButtonConfig,
  CardContainer,
  Input,
  moveQuickLinkFocusByDirection,
  WINDOW_OPEN_FEATURES,
  type Direction,
} from '@vigilant-broccoli/react-lib';
import { useRef, useState } from 'react';
import { OPEN_TYPE, type OpenType } from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { DashboardIcon, ListBulletIcon } from '@radix-ui/react-icons';

interface LinkItem {
  label: string;
  target: string;
  args?: string;
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

  const subgroups = itemsWithSubgroup.reduce(
    (acc, link) => {
      const group = link.subgroup!;
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(link);
      return acc;
    },
    {} as Record<string, LinkItem[]>,
  );

  const subgroupEntries = alphabeticalSubgroups
    ? Object.entries(subgroups).sort(([a], [b]) => a.localeCompare(b))
    : subgroupOrder.map(key => [key, subgroups[key]] as [string, LinkItem[]]);

  const handleShellExecute = async (
    type: OpenType,
    target: string,
    args?: string,
  ) => {
    try {
      const response = await authFetch(API_ENDPOINTS.SHELL_EXECUTE, {
        method: HTTP_METHOD.POST,
        headers: {
          ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        },
        body: JSON.stringify({ type, target, args }),
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
    moveQuickLinkFocusByDirection({
      contentRoot: contentRef.current,
      searchInput: searchInputRef.current,
      currentElement: e.currentTarget as HTMLElement,
      direction,
    });
  };

  const toLinkButtonConfig = (link: LinkItem): ButtonConfig => {
    if (
      link.type === OPEN_TYPE.MAC_APPLICATION ||
      link.type === OPEN_TYPE.VSCODE ||
      link.type === OPEN_TYPE.FILE_SYSTEM
    ) {
      return {
        label: link.label,
        onClick: () => handleShellExecute(link.type, link.target, link.args),
      };
    }

    if (link.type === OPEN_TYPE.INTERNAL) {
      return {
        label: link.label,
        onClick: () => {
          window.location.href = link.target;
        },
      };
    }

    return {
      label: link.label,
      onClick: () => window.open(link.target, '_blank', WINDOW_OPEN_FEATURES),
      isExternal: true,
    };
  };

  return (
    <CardContainer
      title={title}
      gap="3"
      headerAction={
        <div className="flex gap-2 items-center">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleGroupedToggle}
            title={isGrouped ? 'Show ungrouped' : 'Show grouped'}
          >
            {isGrouped ? <ListBulletIcon /> : <DashboardIcon />}
          </Button>
          <Input
            ref={searchInputRef}
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-[150px]"
          />
        </div>
      }
    >
      <div ref={contentRef}>
        {isGrouped ? (
          <div className="flex flex-col gap-4">
            {itemsWithoutSubgroup.length > 0 && (
              <ButtonList
                buttons={itemsWithoutSubgroup.map(toLinkButtonConfig)}
              />
            )}

            {subgroupEntries.map(([subgroupName, subgroupLinks]) => (
              <div key={subgroupName}>
                <Text size="3" weight="medium" className="mb-2">
                  {subgroupName}
                </Text>
                <ButtonList buttons={subgroupLinks.map(toLinkButtonConfig)} />
              </div>
            ))}
          </div>
        ) : (
          <ButtonList buttons={sortedLinks.map(toLinkButtonConfig)} />
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
