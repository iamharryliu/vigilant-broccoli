'use client';

import { Checklist } from '../components/Checklist';

type Props = {
  onCalendarEventAdded?: () => void;
};

export function KitchenChoresList({ onCalendarEventAdded }: Props) {
  return (
    <Checklist
      endpoint="/api/kitchen-chores"
      storageKeyPrefix="kitchen-chores"
      addPlaceholder="Add a chore"
      emptyText="No kitchen chores yet"
      onCalendarEventAdded={onCalendarEventAdded}
    />
  );
}
