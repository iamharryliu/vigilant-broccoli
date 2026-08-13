'use client';

import { Checklist } from '../components/Checklist';

type Props = {
  refreshSignal?: number;
};

export function GroceryList({ refreshSignal }: Props) {
  return (
    <Checklist
      endpoint="/api/grocery"
      storageKeyPrefix="grocery"
      addPlaceholder="Add an item"
      emptyText="Nothing on the list yet"
      refreshSignal={refreshSignal}
    />
  );
}
