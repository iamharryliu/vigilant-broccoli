'use client';

import { useEffect, useRef, useState } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { Badge, Button, Dialog, Flex, Text } from '@radix-ui/themes';
import { CalendarEvent, LeisureActivity } from '../../../lib/types';
import {
  LeisureActivityForm,
  LeisureActivityFormData,
} from './LeisureActivityForm';

const CATEGORY_COLORS: Record<string, string> = {
  Movies: 'blue',
  Shows: 'purple',
  Crafts: 'orange',
  Games: 'green',
  Outdoors: 'teal',
  Music: 'pink',
  Books: 'yellow',
  Other: 'gray',
};

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; activity: LeisureActivity }
  | null;

interface Props {
  activities: LeisureActivity[];
  calendarEvents: CalendarEvent[];
  onAdd: (data: LeisureActivityFormData) => Promise<void>;
  onEdit: (id: string, data: LeisureActivityFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function LeisureList({
  activities,
  calendarEvents,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const linkedEventCount = (activityId: string) =>
    calendarEvents.filter(e => e.leisureActivityId === activityId).length;
  const listRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const draggable = new Draggable(listRef.current, {
      itemSelector: '[data-leisure-id]',
      eventData: el => ({
        title: el.dataset.title ?? '',
        duration: { hours: 2 },
        extendedProps: {
          leisureId: el.dataset.leisureId,
          description: el.dataset.description ?? '',
          category: el.dataset.category ?? '',
        },
      }),
    });
    return () => draggable.destroy();
  }, []);

  const handleAdd = async (data: LeisureActivityFormData) => {
    await onAdd(data);
    setModal(null);
  };

  const handleEdit = async (data: LeisureActivityFormData) => {
    if (modal?.type !== 'edit') return;
    await onEdit(modal.activity.id, data);
    setModal(null);
  };

  const handleDelete = async () => {
    if (modal?.type !== 'edit') return;
    await onDelete(modal.activity.id);
    setModal(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <Flex justify="between" align="center">
        <Text size="4" weight="bold">
          Activity List
        </Text>
        <Button
          size="2"
          onClick={() => setModal({ type: 'create' })}
          className="cursor-pointer"
        >
          + Add
        </Button>
      </Flex>

      <Text size="1" color="gray">
        Drag any activity onto the calendar to schedule it.
      </Text>

      <div ref={listRef} className="flex flex-col gap-2">
        {activities.length === 0 && (
          <Text size="2" color="gray">
            No activities yet. Add one to get started.
          </Text>
        )}
        {activities.map(activity => {
          const count = linkedEventCount(activity.id);
          return (
            <div
              key={activity.id}
              data-leisure-id={activity.id}
              data-title={activity.title}
              data-description={activity.description ?? ''}
              data-category={activity.category}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  color={CATEGORY_COLORS[activity.category] as never}
                  variant="soft"
                  size="1"
                >
                  {activity.category}
                </Badge>
                <div className="min-w-0">
                  <Text size="2" weight="medium" className="truncate block">
                    {activity.title}
                  </Text>
                  {activity.description && (
                    <Text size="1" color="gray" className="truncate block">
                      {activity.description}
                    </Text>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {count > 0 && (
                  <Badge color="gray" variant="surface" size="1">
                    {count} scheduled
                  </Badge>
                )}
                <button
                  onClick={() => setModal({ type: 'edit', activity })}
                  className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                >
                  Edit
                </button>
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
            {modal?.type === 'edit' ? 'Edit Activity' : 'Add Activity'}
          </Dialog.Title>

          {modal?.type === 'create' && (
            <LeisureActivityForm
              onSubmit={handleAdd}
              onCancel={() => setModal(null)}
            />
          )}

          {modal?.type === 'edit' && (
            <LeisureActivityForm
              initialData={{
                title: modal.activity.title,
                description: modal.activity.description ?? '',
                category: modal.activity.category,
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
