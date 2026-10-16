'use client';

import {
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Dialog,
  DialogContent,
  DialogTitle,
  cn,
} from '@vigilant-broccoli/react-lib';
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
    <Dialog
      open={recipe !== null}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className={cn(
          'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
          FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
        )}
        style={{ maxWidth: 480 }}
      >
        <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
          {DIALOG_TITLE}
        </DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
}
