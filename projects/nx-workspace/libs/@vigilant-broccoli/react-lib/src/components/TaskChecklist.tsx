'use client';
import { ReactNode, useCallback, useMemo } from 'react';
import { Text } from './Text';
import { CheckListItem } from './CheckList';
import { getCommitType } from '../utils/commit-type.utils';

export const SORT_MODE = {
  DEFAULT: 'default',
  EISENHOWER: 'eisenhower',
  COMMIT_TYPE: 'commitType',
  DATE_CREATED_NEWEST: 'dateCreatedNewest',
  DATE_CREATED_OLDEST: 'dateCreatedOldest',
} as const;

export type SortMode = (typeof SORT_MODE)[keyof typeof SORT_MODE];

export const SORT_MODE_OPTIONS = Object.values(SORT_MODE);

export const SORT_MODE_LABELS: Record<SortMode, string> = {
  [SORT_MODE.DEFAULT]: 'Default',
  [SORT_MODE.EISENHOWER]: 'Eisenhower Matrix',
  [SORT_MODE.COMMIT_TYPE]: 'Commit Type',
  [SORT_MODE.DATE_CREATED_NEWEST]: 'Date Created (Newest)',
  [SORT_MODE.DATE_CREATED_OLDEST]: 'Date Created (Oldest)',
};

export type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'none';

export const QUADRANT_COLORS: Record<EisenhowerQuadrant, string> = {
  Q1: 'bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500',
  Q2: 'bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500',
  Q3: 'bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500',
  Q4: 'bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500',
  none: '',
};

export const getEisenhowerQuadrant = (title: string): EisenhowerQuadrant => {
  const match = title.match(/^(Q[1-4])[\s:]/i);
  if (match) {
    return match[1].toUpperCase() as EisenhowerQuadrant;
  }
  return 'none';
};

const sortByEisenhower = (items: CheckListItem[]): CheckListItem[] => {
  const priorityMap: Record<EisenhowerQuadrant, number> = {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4,
    none: 5,
  };

  return [...items].sort((a, b) => {
    const quadrantA = getEisenhowerQuadrant(a.title);
    const quadrantB = getEisenhowerQuadrant(b.title);
    return priorityMap[quadrantA] - priorityMap[quadrantB];
  });
};

const sortByCommitType = (items: CheckListItem[]): CheckListItem[] =>
  [...items].sort((a, b) =>
    getCommitType(a.title).localeCompare(getCommitType(b.title)),
  );

const sortByDateCreated = (
  items: CheckListItem[],
  newest = true,
): CheckListItem[] =>
  [...items].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return newest ? dateB - dateA : dateA - dateB;
  });

const sortItems = (items: CheckListItem[], sortMode: SortMode) => {
  if (sortMode === SORT_MODE.EISENHOWER) return sortByEisenhower(items);
  if (sortMode === SORT_MODE.COMMIT_TYPE) return sortByCommitType(items);
  if (sortMode === SORT_MODE.DATE_CREATED_NEWEST)
    return sortByDateCreated(items, true);
  if (sortMode === SORT_MODE.DATE_CREATED_OLDEST)
    return sortByDateCreated(items, false);
  return items;
};

export interface TaskChecklistView {
  items: CheckListItem[];
  itemClassName: (item: CheckListItem) => string;
  renderItemAccessory: (item: CheckListItem) => ReactNode;
  renderItemMeta: (item: CheckListItem) => ReactNode;
}

/**
 * Bridges a plain CheckListItem[] to CheckList's render-prop surface using
 * this app's title conventions (a leading "Q1:"-style Eisenhower quadrant,
 * a leading "feat:"-style commit type) - independent of which backend the
 * items came from, so a future non-Google task source can reuse it as-is.
 */
export const useTaskChecklistView = (
  items: CheckListItem[],
  sortMode: SortMode,
): TaskChecklistView => {
  const sortedItems = useMemo(
    () => sortItems(items, sortMode),
    [items, sortMode],
  );

  const showCreatedMeta =
    sortMode === SORT_MODE.DATE_CREATED_NEWEST ||
    sortMode === SORT_MODE.DATE_CREATED_OLDEST;

  const itemClassName = useCallback(
    (item: CheckListItem) => QUADRANT_COLORS[getEisenhowerQuadrant(item.title)],
    [],
  );

  const renderItemAccessory = useCallback((item: CheckListItem) => {
    const commitType = getCommitType(item.title);
    if (commitType === 'other') return null;
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 self-start">
        {commitType}
      </span>
    );
  }, []);

  const renderItemMeta = useCallback(
    (item: CheckListItem) =>
      showCreatedMeta && item.updatedAt ? (
        <Text size="1" color="gray">
          Created: {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      ) : null,
    [showCreatedMeta],
  );

  return {
    items: sortedItems,
    itemClassName,
    renderItemAccessory,
    renderItemMeta,
  };
};
