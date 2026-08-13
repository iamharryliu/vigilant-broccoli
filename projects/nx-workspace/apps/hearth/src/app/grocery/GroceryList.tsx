'use client';

import { Checklist } from '../components/Checklist';

export function GroceryList() {
  return (
    <Checklist
      endpoint="/api/grocery"
      storageKeyPrefix="grocery"
      addPlaceholder="Add an item"
      emptyText="Nothing on the list yet"
    />
  );
}
