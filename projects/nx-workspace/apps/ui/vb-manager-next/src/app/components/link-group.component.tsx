'use client';

import { Text, TextField, IconButton, Flex } from '@radix-ui/themes';
import { useState } from 'react';
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

  const renderLink = (link: LinkItem) => {
    const baseClass = 'inline-flex justify-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium w-fit transition-colors';

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
        >
          {link.label}
        </button>
      );
    }

    // Browser links
    return (
      <a
        key={link.target}
        href={link.target}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
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
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="1"
            style={{ width: '150px' }}
          />
        </Flex>
      }
    >
      {isGrouped ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sortedLinks.map((link) => renderLink(link))}
        </div>
      )}

      {filteredLinks.length === 0 && searchQuery && (
        <Text size="2" color="gray">
          No links found matching &quot;{searchQuery}&quot;
        </Text>
      )}
    </CardContainer>
  );
}
