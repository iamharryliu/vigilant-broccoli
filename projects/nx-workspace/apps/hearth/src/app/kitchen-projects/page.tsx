'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { KitchenProjectsList } from './KitchenProjectsList';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function KitchenProjectsPage() {
  usePageTitle(PAGE_TITLES.KITCHEN_PROJECTS);
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 md:max-w-none md:px-8 md:py-8">
      <Text size="6" weight="bold">
        Kitchen Projects
      </Text>
      <KitchenProjectsList />
    </div>
  );
}
