'use client';

import { Text, cn } from '@vigilant-broccoli/react-lib';
import { KitchenEvents } from '../food-planner/KitchenEvents';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';
import {
  FULL_HEIGHT_PAGE_CLASS,
  PAGE_PADDING_CLASS,
} from '../../lib/page-layout';

export default function FoodCalendarPage() {
  usePageTitle(PAGE_TITLES.FOOD_CALENDAR);
  return (
    <div
      className={cn(
        'mx-auto flex max-w-3xl flex-col gap-4 md:max-w-none',
        PAGE_PADDING_CLASS,
        FULL_HEIGHT_PAGE_CLASS,
      )}
    >
      <Text size="6" weight="bold">
        Kitchen Events
      </Text>
      <div className="min-h-0 flex-1">
        <KitchenEvents />
      </div>
    </div>
  );
}
