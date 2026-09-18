'use client';

import { Dialog } from '@radix-ui/themes';
import { FULL_SCREEN_ON_MOBILE_DIALOG_CLASS } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import {
  CalendarEventForm,
  type CalendarEventFormData,
} from '../calendar/components/CalendarEventForm';
import { Recipe } from './recipes.types';

const CALENDAR_EVENTS_ENDPOINT = '/api/calendar/events';
const EVENT_DEFAULT_DURATION_MS = 60 * 60 * 1000;
const TAB_PARAM = 'tab';
const RECIPE_PARAM = 'recipe';
const RECIPES_TAB_VALUE = 'recipes';
const DIALOG_TITLE = 'Add to Calendar';

const buildRecipeBacklink = (recipe: Recipe): string => {
  const url = new URL('/food-planner', window.location.origin);
  url.searchParams.set(TAB_PARAM, RECIPES_TAB_VALUE);
  url.searchParams.set(RECIPE_PARAM, recipe.id);
  return `Recipe: ${recipe.title}\n${url.toString()}`;
};

type Props = {
  recipe: Recipe | null;
  onClose: () => void;
  onAdded: () => void;
};

export function AddToCalendarDialog({ recipe, onClose, onAdded }: Props) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';

  const handleSubmit = async (data: CalendarEventFormData) => {
    if (!homeId) return;
    await fetch(CALENDAR_EVENTS_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, homeId, kitchenEvent: true }),
    });
    onAdded();
    onClose();
  };

  return (
    <Dialog.Root
      open={recipe !== null}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content
        className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
        style={{ maxWidth: 480 }}
      >
        <Dialog.Title>{DIALOG_TITLE}</Dialog.Title>
        {recipe && (
          <CalendarEventForm
            initialData={{
              title: recipe.title,
              description: buildRecipeBacklink(recipe),
              start: new Date().toISOString(),
              end: new Date(
                Date.now() + EVENT_DEFAULT_DURATION_MS,
              ).toISOString(),
              allDay: false,
              color: '',
            }}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
