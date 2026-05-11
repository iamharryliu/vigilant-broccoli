'use client';

import { useEffect, useRef, useState } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { Badge, Button, Dialog, Flex, Text } from '@radix-ui/themes';
import { EllipsisCTA } from '@vigilant-broccoli/react-lib';
import { CalendarEvent, Meal } from '../../../lib/types';
import { MealForm, MealFormData } from './MealForm';

const CATEGORY_COLORS: Record<string, string> = {
  Breakfast: 'yellow',
  Lunch: 'green',
  Dinner: 'blue',
  Snack: 'orange',
  Dessert: 'pink',
  Other: 'gray',
};

type ModalState = { type: 'create' } | { type: 'edit'; meal: Meal } | null;

interface Props {
  meals: Meal[];
  calendarEvents: CalendarEvent[];
  onAdd: (data: MealFormData) => Promise<void>;
  onEdit: (id: string, data: MealFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  hideDragHint?: boolean;
  onItemClick?: (meal: Meal) => void;
}

export function MealList({
  meals,
  calendarEvents,
  onAdd,
  onEdit,
  onDelete,
  hideDragHint,
  onItemClick,
}: Props) {
  const linkedEventCount = (mealId: string) =>
    calendarEvents.filter(e => e.mealId === mealId).length;

  const listRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const draggable = new Draggable(listRef.current, {
      itemSelector: '[data-meal-id]',
      eventData: el => ({
        title: el.dataset.title ?? '',
        duration: { hours: 1 },
        extendedProps: {
          mealId: el.dataset.mealId,
          description: el.dataset.description ?? '',
          category: el.dataset.category ?? '',
        },
      }),
    });
    return () => draggable.destroy();
  }, []);

  const handleAdd = async (data: MealFormData) => {
    await onAdd(data);
    setModal(null);
  };

  const handleEdit = async (data: MealFormData) => {
    if (modal?.type !== 'edit') return;
    await onEdit(modal.meal.id, data);
    setModal(null);
  };

  const handleDelete = async () => {
    if (modal?.type !== 'edit') return;
    await onDelete(modal.meal.id);
    setModal(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <Flex justify="between" align="center">
        <Text size="4" weight="bold">
          Meal List
        </Text>
        <Button
          size="2"
          onClick={() => setModal({ type: 'create' })}
          className="cursor-pointer"
        >
          + Add
        </Button>
      </Flex>

      {!hideDragHint && (
        <Text size="1" color="gray">
          Drag any meal onto the calendar to plan it.
        </Text>
      )}

      <div ref={listRef} className="flex flex-col gap-2">
        {meals.length === 0 && (
          <Text size="2" color="gray">
            No meals yet. Add one to get started.
          </Text>
        )}
        {meals.map(meal => {
          const count = linkedEventCount(meal.id);
          return (
            <div
              key={meal.id}
              data-meal-id={meal.id}
              data-title={meal.title}
              data-description={meal.description ?? ''}
              data-category={meal.category}
              className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white transition-colors ${onItemClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-grab active:cursor-grabbing hover:border-gray-300'}`}
              onClick={onItemClick ? () => onItemClick(meal) : undefined}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  color={CATEGORY_COLORS[meal.category] as never}
                  variant="soft"
                  size="1"
                >
                  {meal.category}
                </Badge>
                <div className="min-w-0">
                  <Text size="2" weight="medium" className="truncate block">
                    {meal.title}
                  </Text>
                  {meal.servings && (
                    <Text size="1" color="gray" className="truncate block">
                      {meal.servings} servings
                    </Text>
                  )}
                  {meal.createdByEmail && (
                    <Text size="1" color="gray" className="truncate block">
                      {meal.createdByEmail}
                    </Text>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {count > 0 && (
                  <Badge color="gray" variant="surface" size="1">
                    {count} planned
                  </Badge>
                )}
                <EllipsisCTA
                  onUpdate={() => setModal({ type: 'edit', meal })}
                  onDelete={() => onDelete(meal.id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Dialog.Root
        open={modal !== null}
        onOpenChange={open => {
          if (!open) setModal(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 440 }}>
          <Dialog.Title>
            {modal?.type === 'edit' ? 'Edit Meal' : 'Add Meal'}
          </Dialog.Title>

          {modal?.type === 'create' && (
            <MealForm onSubmit={handleAdd} onCancel={() => setModal(null)} />
          )}

          {modal?.type === 'edit' && (
            <MealForm
              initialData={{
                title: modal.meal.title,
                description: modal.meal.description ?? '',
                category: modal.meal.category,
                servings: modal.meal.servings,
              }}
              onSubmit={handleEdit}
              onDelete={handleDelete}
              onCancel={() => setModal(null)}
              isEdit
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
