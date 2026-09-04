'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { GroceryList } from './GroceryList';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function GroceryPage() {
  usePageTitle(PAGE_TITLES.GROCERY);
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 md:max-w-none md:px-8 md:py-8">
      <Text size="6" weight="bold">
        Grocery List
      </Text>
      <GroceryList />
    </div>
  );
}
