'use client';

import { useEffect, useRef, useState } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { Badge, Button, Dialog, Flex, Text } from '@radix-ui/themes';
import { CalendarEvent, HomeProject } from '../../../lib/types';
import { HomeProjectForm, HomeProjectFormData } from './HomeProjectForm';

const CATEGORY_COLORS: Record<string, string> = {
  Renovation: 'orange',
  Painting: 'blue',
  Furniture: 'brown',
  Plumbing: 'cyan',
  Electrical: 'yellow',
  Garden: 'green',
  Cleaning: 'teal',
  Other: 'gray',
};

const STATUS_COLORS: Record<string, 'gray' | 'amber' | 'green'> = {
  Todo: 'gray',
  'In Progress': 'amber',
  Done: 'green',
};

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; project: HomeProject }
  | null;

interface Props {
  projects: HomeProject[];
  calendarEvents: CalendarEvent[];
  onAdd: (data: HomeProjectFormData) => Promise<void>;
  onEdit: (id: string, data: HomeProjectFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  hideDragHint?: boolean;
}

export function HomeProjectList({
  projects,
  calendarEvents,
  onAdd,
  onEdit,
  onDelete,
  hideDragHint,
}: Props) {
  const linkedEventCount = (projectId: string) =>
    calendarEvents.filter(e => e.projectId === projectId).length;

  const listRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const draggable = new Draggable(listRef.current, {
      itemSelector: '[data-project-id]',
      eventData: el => ({
        title: el.dataset.title ?? '',
        duration: { hours: 2 },
        extendedProps: {
          projectId: el.dataset.projectId,
          description: el.dataset.description ?? '',
          category: el.dataset.category ?? '',
        },
      }),
    });
    return () => draggable.destroy();
  }, []);

  const handleAdd = async (data: HomeProjectFormData) => {
    await onAdd(data);
    setModal(null);
  };

  const handleEdit = async (data: HomeProjectFormData) => {
    if (modal?.type !== 'edit') return;
    await onEdit(modal.project.id, data);
    setModal(null);
  };

  const handleDelete = async () => {
    if (modal?.type !== 'edit') return;
    await onDelete(modal.project.id);
    setModal(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <Flex justify="between" align="center">
        <Text size="4" weight="bold">
          Project List
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
          Drag any project onto the calendar to schedule it.
        </Text>
      )}

      <div ref={listRef} className="flex flex-col gap-2">
        {projects.length === 0 && (
          <Text size="2" color="gray">
            No projects yet. Add one to get started.
          </Text>
        )}
        {projects.map(project => {
          const count = linkedEventCount(project.id);
          return (
            <div
              key={project.id}
              data-project-id={project.id}
              data-title={project.title}
              data-description={project.description ?? ''}
              data-category={project.category}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  color={CATEGORY_COLORS[project.category] as never}
                  variant="soft"
                  size="1"
                >
                  {project.category}
                </Badge>
                <div className="min-w-0">
                  <Text size="2" weight="medium" className="truncate block">
                    {project.title}
                  </Text>
                  {project.description && (
                    <Text size="1" color="gray" className="truncate block">
                      {project.description}
                    </Text>
                  )}
                  {project.createdByEmail && (
                    <Text size="1" color="gray" className="truncate block">
                      {project.createdByEmail}
                    </Text>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <Badge
                  color={STATUS_COLORS[project.status]}
                  variant="surface"
                  size="1"
                >
                  {project.status}
                </Badge>
                {count > 0 && (
                  <Badge color="gray" variant="surface" size="1">
                    {count} scheduled
                  </Badge>
                )}
                <button
                  onClick={() => setModal({ type: 'edit', project })}
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
            {modal?.type === 'edit' ? 'Edit Project' : 'Add Project'}
          </Dialog.Title>

          {modal?.type === 'create' && (
            <HomeProjectForm
              onSubmit={handleAdd}
              onCancel={() => setModal(null)}
            />
          )}

          {modal?.type === 'edit' && (
            <HomeProjectForm
              initialData={{
                title: modal.project.title,
                description: modal.project.description ?? '',
                category: modal.project.category,
                status: modal.project.status,
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
