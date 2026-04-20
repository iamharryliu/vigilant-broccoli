'use client';

import { useEffect, useRef, useState } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { Badge, Button, Dialog, Flex, Text } from '@radix-ui/themes';
import { Resource, ResourceBooking } from '../../../lib/types';
import { ResourceForm, ResourceFormData } from './ResourceForm';

const CATEGORY_COLORS: Record<string, string> = {
  Vehicle: 'blue',
  Room: 'green',
  Equipment: 'orange',
  Electronics: 'purple',
  Furniture: 'cyan',
  Tool: 'red',
  Other: 'gray',
};

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; resource: Resource }
  | null;

interface Props {
  resources: Resource[];
  bookings: ResourceBooking[];
  onAdd: (data: ResourceFormData) => Promise<void>;
  onEdit: (id: string, data: ResourceFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ResourceList({
  resources,
  bookings,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const bookingCount = (resourceId: string) =>
    bookings.filter(b => b.resourceId === resourceId).length;

  useEffect(() => {
    if (!listRef.current) return;
    const draggable = new Draggable(listRef.current, {
      itemSelector: '[data-resource-id]',
      eventData: el => ({
        title: el.dataset.title ?? '',
        duration: { days: 1 },
        allDay: true,
        extendedProps: {
          resourceId: el.dataset.resourceId,
          description: el.dataset.description ?? '',
          category: el.dataset.category ?? '',
        },
      }),
    });
    return () => draggable.destroy();
  }, []);

  const handleAdd = async (data: ResourceFormData) => {
    await onAdd(data);
    setModal(null);
  };

  const handleEdit = async (data: ResourceFormData) => {
    if (modal?.type !== 'edit') return;
    await onEdit(modal.resource.id, data);
    setModal(null);
  };

  const handleDelete = async () => {
    if (modal?.type !== 'edit') return;
    await onDelete(modal.resource.id);
    setModal(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <Flex justify="between" align="center">
        <Text size="4" weight="bold">
          Resources
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
        Drag any resource onto the calendar to book it.
      </Text>

      <div ref={listRef} className="flex flex-col gap-2">
        {resources.length === 0 && (
          <Text size="2" color="gray">
            No resources yet. Add one to get started.
          </Text>
        )}
        {resources.map(resource => {
          const count = bookingCount(resource.id);
          return (
            <div
              key={resource.id}
              data-resource-id={resource.id}
              data-title={resource.name}
              data-description={resource.description ?? ''}
              data-category={resource.category}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  color={CATEGORY_COLORS[resource.category] as never}
                  variant="soft"
                  size="1"
                >
                  {resource.category}
                </Badge>
                <div className="min-w-0">
                  <Text size="2" weight="medium" className="truncate block">
                    {resource.name}
                    {resource.quantity > 1 && (
                      <Text size="1" color="gray">
                        {' '}
                        ×{resource.quantity}
                      </Text>
                    )}
                  </Text>
                  {resource.description && (
                    <Text size="1" color="gray" className="truncate block">
                      {resource.description}
                    </Text>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {count > 0 && (
                  <Badge color="gray" variant="surface" size="1">
                    {count} booked
                  </Badge>
                )}
                <button
                  onClick={() => setModal({ type: 'edit', resource })}
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
            {modal?.type === 'edit' ? 'Edit Resource' : 'Add Resource'}
          </Dialog.Title>

          {modal?.type === 'create' && (
            <ResourceForm
              onSubmit={handleAdd}
              onCancel={() => setModal(null)}
            />
          )}

          {modal?.type === 'edit' && (
            <ResourceForm
              initialData={{
                name: modal.resource.name,
                description: modal.resource.description ?? '',
                category: modal.resource.category,
                quantity: modal.resource.quantity,
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
