'use client';

import { useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { Text, Badge } from '@vigilant-broccoli/react-lib';

const CATEGORY_COLORS: Record<string, string> = {
  Breakfast: 'yellow',
  Lunch: 'green',
  Dinner: 'blue',
  Snack: 'orange',
  Dessert: 'pink',
};

type MockMeal = {
  title: string;
  category: string;
  description?: string;
};

const MOCK_MEALS: MockMeal[] = [
  { title: 'Pancakes', category: 'Breakfast' },
  { title: 'Veggie Omelette', category: 'Breakfast' },
  { title: 'Chicken Caesar Salad', category: 'Lunch' },
  { title: 'Turkey Sandwich', category: 'Lunch' },
  { title: 'Spaghetti Bolognese', category: 'Dinner' },
  { title: 'Grilled Salmon', category: 'Dinner' },
  { title: 'Taco Night', category: 'Dinner' },
  { title: 'Veggie Stir-Fry', category: 'Dinner' },
  { title: 'Fruit & Yogurt', category: 'Snack' },
  { title: 'Brownies', category: 'Dessert' },
];

export function MockMealList() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const draggable = new Draggable(listRef.current, {
      itemSelector: '[data-meal-title]',
      eventData: el => ({
        title: el.dataset.mealTitle ?? '',
        duration: { hours: 1 },
        extendedProps: { description: el.dataset.description ?? '' },
      }),
    });
    return () => draggable.destroy();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <Text size="4" weight="bold">
        Meals
      </Text>
      <Text size="1" color="gray">
        Drag a meal onto the calendar to plan it.
      </Text>

      <div ref={listRef} className="flex flex-col gap-2">
        {MOCK_MEALS.map(meal => (
          <div
            key={meal.title}
            data-meal-title={meal.title}
            data-description={meal.description ?? ''}
            className="flex items-center gap-2 rounded-lg border border-[var(--gray-a5)] bg-[var(--gray-a2)] p-3 cursor-grab transition-colors hover:border-[var(--gray-a8)] active:cursor-grabbing"
          >
            <Badge
              color={CATEGORY_COLORS[meal.category] as never}
              variant="soft"
              size="1"
            >
              {meal.category}
            </Badge>
            <Text size="2" weight="medium" className="truncate">
              {meal.title}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
