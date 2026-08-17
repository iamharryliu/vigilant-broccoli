'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { KitchenChoresList } from './KitchenChoresList';

export default function KitchenChoresPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 md:max-w-none md:px-8 md:py-8">
      <Text size="6" weight="bold">
        Kitchen Chores
      </Text>
      <KitchenChoresList />
    </div>
  );
}
