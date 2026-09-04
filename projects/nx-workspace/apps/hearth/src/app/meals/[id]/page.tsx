'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Text, Badge } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../../providers/auth-provider';
import { Meal } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';
import { PAGE_TITLES, usePageTitle } from '../../../lib/page-title';

const CATEGORY_COLORS: Record<string, string> = {
  Breakfast: 'yellow',
  Lunch: 'green',
  Dinner: 'blue',
  Snack: 'orange',
  Dessert: 'pink',
  Other: 'gray',
};

export default function MealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [meal, setMeal] = useState<Meal | null>(null);
  usePageTitle(meal?.title ?? PAGE_TITLES.MEAL_DETAIL);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/meals?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setMeal);
  }, [id, session?.access_token]);

  if (!meal) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link
        href={ROUTES.MASTER_LIST}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <Text size="6" weight="bold">
          {meal.title}
        </Text>
        <Badge
          color={CATEGORY_COLORS[meal.category] as never}
          variant="soft"
          size="2"
        >
          {meal.category}
        </Badge>
        {meal.servings && (
          <Badge variant="outline" size="2">
            {meal.servings} servings
          </Badge>
        )}
      </div>

      {meal.description && (
        <Text size="3" color="gray" as="p">
          {meal.description}
        </Text>
      )}

      {meal.createdByEmail && (
        <Text size="2" color="gray" as="p">
          Added by {meal.createdByEmail}
        </Text>
      )}

      <Text size="1" color="gray" as="p">
        Added{' '}
        {new Date(meal.createdAt).toLocaleDateString(undefined, {
          dateStyle: 'medium',
        })}
      </Text>
    </div>
  );
}
