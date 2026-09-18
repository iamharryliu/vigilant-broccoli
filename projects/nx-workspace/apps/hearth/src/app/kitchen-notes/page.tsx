'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { KitchenNotes } from './KitchenNotes';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function KitchenNotesPage() {
  usePageTitle(PAGE_TITLES.KITCHEN_NOTES);
  return (
    <div className="mx-auto flex h-[calc(100dvh_-_var(--topbar-h)_-_5rem)] max-w-3xl flex-col gap-4 p-4 sm:p-6 md:max-w-none md:px-8 md:py-8">
      <Text size="6" weight="bold">
        Kitchen Notes
      </Text>
      <div className="min-h-0 flex-1">
        <KitchenNotes />
      </div>
    </div>
  );
}
