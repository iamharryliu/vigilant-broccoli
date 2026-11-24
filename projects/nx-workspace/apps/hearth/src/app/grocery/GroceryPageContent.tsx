'use client';

import { ListHeader, SortSelect, Text } from '@vigilant-broccoli/react-lib';
import { GROCERY_STORAGE_KEY_PREFIX, GroceryList } from './GroceryList';
import {
  GROCERY_SORT_MODE_LABELS,
  GROCERY_SORT_MODE_OPTIONS,
} from './grocery-sections.consts';
import { useGrocerySortMode } from './use-grocery-sort-mode';

export function GroceryPageContent() {
  const [sortMode, setSortMode] = useGrocerySortMode(
    GROCERY_STORAGE_KEY_PREFIX,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 md:max-w-none md:px-8 md:py-8">
      <ListHeader
        title={
          <Text size="6" weight="bold">
            Grocery List
          </Text>
        }
      >
        <SortSelect
          value={sortMode}
          onValueChange={setSortMode}
          options={GROCERY_SORT_MODE_OPTIONS}
          labels={GROCERY_SORT_MODE_LABELS}
        />
      </ListHeader>
      <GroceryList sortMode={sortMode} />
    </div>
  );
}
