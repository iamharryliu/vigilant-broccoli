'use client';

import { Checklist } from '../components/Checklist';

type Props = {
  refreshSignal?: number;
  onCalendarEventAdded?: () => void;
};

export function GroceryList({ refreshSignal, onCalendarEventAdded }: Props) {
  return (
    <Checklist
      endpoint="/api/grocery"
      storageKeyPrefix="grocery"
      addPlaceholder="Add an item"
      emptyText="Nothing on the list yet"
      refreshSignal={refreshSignal}
      onCalendarEventAdded={onCalendarEventAdded}
    />
  );
}
