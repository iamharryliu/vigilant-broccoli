'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, IconButton, TextField, Text, Flex } from '@radix-ui/themes';
import { MagnifyingGlassIcon, DashboardIcon, ListBulletIcon } from '@radix-ui/react-icons';
import { QUICK_LINKS } from '../constants/quick-links';
import { OPEN_TYPE, type OpenType } from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const LOCAL_STORAGE_KEY = 'quick-links-grouped-state';

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

type SearchDialogComponentProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SearchDialogComponent({ open: externalOpen, onOpenChange: externalOnOpenChange }: SearchDialogComponentProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const open = externalOpen ?? internalOpen;
  const setOpen = externalOnOpenChange ?? setInternalOpen;
  const [isGrouped, setIsGrouped] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const filteredLinks = searchQuery
    ? QUICK_LINKS.filter(link => fuzzyMatch(searchQuery, link.label))
    : QUICK_LINKS;

  const sortedLinks = [...filteredLinks].sort((a, b) => a.label.localeCompare(b.label));

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

  const subgroupEntries = Object.entries(subgroups).sort(([a], [b]) => a.localeCompare(b));

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

    if (nonBrowserTypes.includes(firstLink.type as typeof nonBrowserTypes[number])) {
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
    }
  };

  const renderLink = (link: typeof QUICK_LINKS[0]) => {
    const baseClass = 'inline-flex justify-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium w-fit transition-colors';

    const nonBrowserTypes = [
      OPEN_TYPE.MAC_APPLICATION,
      OPEN_TYPE.VSCODE,
      OPEN_TYPE.FILE_SYSTEM,
    ] as const;

    if (nonBrowserTypes.includes(link.type as typeof nonBrowserTypes[number])) {
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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <IconButton variant="soft" size="2" aria-label="Search Quick Links">
          <MagnifyingGlassIcon />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 800, maxHeight: '80vh', overflow: 'auto' }}>
        <Dialog.Title>Quick Links</Dialog.Title>

        <Flex gap="2" align="center" mb="4">
          <TextField.Root
            ref={searchInputRef}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
