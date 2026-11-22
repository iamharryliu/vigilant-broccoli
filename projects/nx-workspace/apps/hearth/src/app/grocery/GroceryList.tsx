'use client';

import { Checklist } from '../components/Checklist';
import { type GrocerySortMode } from './grocery-sections.consts';

export const GROCERY_STORAGE_KEY_PREFIX = 'grocery';

type Props = {
  sortMode: GrocerySortMode;
  refreshSignal?: number;
  onCalendarEventAdded?: () => void;
};

export function GroceryList({
  sortMode,
  refreshSignal,
  onCalendarEventAdded,
}: Props) {
  return (
    <Checklist
      endpoint="/api/grocery"
      storageKeyPrefix={GROCERY_STORAGE_KEY_PREFIX}
      addPlaceholder="Add an item"
      emptyText="Nothing on the list yet"
      refreshSignal={refreshSignal}
      onCalendarEventAdded={onCalendarEventAdded}
      sectionSortMode={sortMode}
    />
  );
}
