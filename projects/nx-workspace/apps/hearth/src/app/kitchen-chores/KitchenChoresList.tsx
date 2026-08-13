'use client';

import { Checklist } from '../components/Checklist';

export function KitchenChoresList() {
  return (
    <Checklist
      endpoint="/api/kitchen-chores"
      storageKeyPrefix="kitchen-chores"
      addPlaceholder="Add a chore"
      emptyText="No kitchen chores yet"
    />
  );
}
