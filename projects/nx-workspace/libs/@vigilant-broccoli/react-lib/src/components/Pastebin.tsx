'use client';

import { useState } from 'react';
import type {
  PastebinEntry,
  PastebinGroup,
} from '@vigilant-broccoli/common-js';
import { CopyButton } from './CopyButton';
import { IconButton } from './IconButton';
import { Input } from './Input';
import { Text } from './Text';
import { WINDOW_OPEN_FEATURES } from '../utils/browser.utils';

const SEARCH_PLACEHOLDER = 'Search pastebin...';
const EMPTY_MESSAGE = 'No entries found.';
const WINDOW_TARGET_BLANK = '_blank';
const URL_PREFIX = 'http';

const matchesQuery = (entry: PastebinEntry, query: string) =>
  `${entry.label} ${entry.value}`.toLowerCase().includes(query);

const filterGroups = (groups: PastebinGroup[], query: string) => {
  if (!query) return groups;
  return groups
    .map(group => ({
      ...group,
      entries: group.entries.filter(entry => matchesQuery(entry, query)),
    }))
    .filter(group => group.entries.length > 0);
};

const PastebinRow = ({ entry }: { entry: PastebinEntry }) => (
  <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700">
    <div className="min-w-0 flex-1">
      <Text as="div" size="2" weight="medium">
        {entry.label}
      </Text>
      <Text
        as="div"
        size="1"
        color="gray"
        className="truncate font-mono"
        title={entry.value}
      >
        {entry.value}
      </Text>
    </div>
    {entry.value.startsWith(URL_PREFIX) && (
      <IconButton
        variant="ghost"
        icon="external-link"
        onClick={() =>
          window.open(entry.value, WINDOW_TARGET_BLANK, WINDOW_OPEN_FEATURES)
        }
      />
    )}
    <CopyButton text={entry.value} />
  </div>
);

export const Pastebin = ({
  groups,
  searchPlaceholder = SEARCH_PLACEHOLDER,
}: {
  groups: PastebinGroup[];
  searchPlaceholder?: string;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredGroups = filterGroups(groups, searchQuery.trim().toLowerCase());

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Input
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={event => setSearchQuery(event.target.value)}
      />

      {filteredGroups.length === 0 ? (
        <Text size="2" color="gray">
          {EMPTY_MESSAGE}
        </Text>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {filteredGroups.map(group => (
            <div key={group.name} className="flex flex-col gap-2">
              <Text size="3" weight="medium">
                {group.name}
              </Text>
              {group.entries.map(entry => (
                <PastebinRow key={entry.value} entry={entry} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
