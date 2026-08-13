'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { FoodCalendar } from '../food-planner/FoodCalendar';

export default function FoodCalendarPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-4 p-4 sm:p-6 md:max-w-none md:px-8 md:py-8">
      <Text size="6" weight="bold">
        Food Calendar
      </Text>
      <div className="min-h-0 flex-1">
        <FoodCalendar />
      </div>
    </div>
  );
}
