'use client';

import { useEffect, useRef, useState } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import {
  Badge,
  Button,
  EllipsisAction,
  EllipsisCTA,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Text,
  Dialog,
  DialogContent,
  DialogTitle,
  cn,
} from '@vigilant-broccoli/react-lib';
import { CalendarEvent, LeisureActivity } from '../../../lib/types';
import {
  CalendarEventForm,
  CalendarEventFormData,
} from '../../calendar/components/CalendarEventForm';
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

const MORE_INFO_LABEL = 'More info';
const ADD_TO_CALENDAR_LABEL = 'Add to calendar';
const EDIT_LABEL = 'Edit';
const DELETE_LABEL = 'Delete';
const DELETE_CONFIRM_TITLE = 'Delete Activity';
const DELETE_CONFIRM_DESCRIPTION =
  'Are you sure you want to delete this activity?';
const ADD_TO_CALENDAR_DIALOG_TITLE = 'Add to calendar';
const EVENT_DEFAULT_DURATION_MS = 60 * 60 * 1000;
const ADDED_BY_PREFIX = 'Added by';
const SCHEDULED_SUFFIX = 'scheduled';
const EMPTY_TEXT = 'No activities yet. Add one to get started.';

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
  onAddToCalendar?: (
    activityId: string,
    data: CalendarEventFormData,
  ) => Promise<void>;
  hideDragHint?: boolean;
  hideTitle?: boolean;
  addSignal?: number;
  onItemClick?: (activity: LeisureActivity) => void;
}

export function LeisureList({
  activities,
  calendarEvents,
  onAdd,
  onEdit,
  onDelete,
  onAddToCalendar,
  hideDragHint,
  hideTitle,
  addSignal,
  onItemClick,
}: Props) {
  const linkedEventCount = (activityId: string) =>
    calendarEvents.filter(e => e.leisureActivityId === activityId).length;
  const listRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [infoActivity, setInfoActivity] = useState<LeisureActivity | null>(
    null,
  );
  const [calendarActivity, setCalendarActivity] =
    useState<LeisureActivity | null>(null);

  useEffect(() => {
    if (addSignal) setModal({ type: 'create' });
  }, [addSignal]);

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

  const handleAddToCalendar = async (data: CalendarEventFormData) => {
    if (!calendarActivity || !onAddToCalendar) return;
    await onAddToCalendar(calendarActivity.id, data);
    setCalendarActivity(null);
  };

  const rowActions = (activity: LeisureActivity): EllipsisAction[] =>
    [
      { label: MORE_INFO_LABEL, onSelect: () => setInfoActivity(activity) },
      onAddToCalendar && {
        label: ADD_TO_CALENDAR_LABEL,
        onSelect: () => setCalendarActivity(activity),
      },
      {
        label: EDIT_LABEL,
        onSelect: () => setModal({ type: 'edit', activity }),
      },
      {
        label: DELETE_LABEL,
        color: 'red' as const,
        onSelect: () => onDelete(activity.id),
        confirm: {
          title: DELETE_CONFIRM_TITLE,
          description: DELETE_CONFIRM_DESCRIPTION,
          confirmLabel: DELETE_LABEL,
        },
      },
    ].filter(Boolean) as EllipsisAction[];

  return (
    <div className="flex flex-col gap-3">
      {!hideTitle && (
        <div className="flex justify-between items-center">
          <Text size="4" weight="bold">
            Activity List
          </Text>
          <Button
            onClick={() => setModal({ type: 'create' })}
            className="cursor-pointer"
          >
            + Add
          </Button>
        </div>
      )}

      {!hideDragHint && (
        <Text size="1" color="gray">
          Drag any activity onto the calendar to schedule it.
        </Text>
      )}

      <div ref={listRef} className="flex flex-col">
        {activities.length === 0 && (
          <div className="py-4">
            <Text align="center" color="gray" size="3">
              {EMPTY_TEXT}
            </Text>
          </div>
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
              className={`flex items-center gap-3 py-1.5 border-b border-[var(--gray-a4)] last:border-b-0 ${
                onItemClick
                  ? 'cursor-pointer'
                  : 'cursor-grab active:cursor-grabbing'
              }`}
              onClick={onItemClick ? () => onItemClick(activity) : undefined}
            >
              <Badge
                color={CATEGORY_COLORS[activity.category] as never}
                variant="soft"
                size="1"
                className="shrink-0"
              >
                {activity.category}
              </Badge>
              <Text size="3" weight="medium" className="grow truncate">
                {activity.title}
              </Text>
              {count > 0 && (
                <Badge
                  color="gray"
                  variant="surface"
                  size="1"
                  className="shrink-0"
                >
                  {count} {SCHEDULED_SUFFIX}
                </Badge>
              )}
              <div onClick={e => e.stopPropagation()}>
                <EllipsisCTA actions={rowActions(activity)} />
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={modal !== null}
        onOpenChange={open => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className={cn(
            'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
            FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
          )}
          style={{ maxWidth: 440 }}
        >
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            {modal?.type === 'edit' ? 'Edit Activity' : 'Add Activity'}
          </DialogTitle>

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
        </DialogContent>
      </Dialog>

      <Dialog
        open={infoActivity !== null}
        onOpenChange={open => {
          if (!open) setInfoActivity(null);
        }}
      >
        <DialogContent
          className="block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
          aria-describedby={undefined}
          showCloseButton={false}
          style={{ maxWidth: 440 }}
        >
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            {infoActivity?.title}
          </DialogTitle>
          {infoActivity && (
            <div className="flex flex-col gap-3">
              <Badge
                color={CATEGORY_COLORS[infoActivity.category] as never}
                variant="soft"
                size="1"
                className="w-fit"
              >
                {infoActivity.category}
              </Badge>
              {infoActivity.description && (
                <Text size="2" color="gray" as="p">
                  {infoActivity.description}
                </Text>
              )}
              {infoActivity.createdByEmail && (
                <Text size="1" color="gray" as="p">
                  {ADDED_BY_PREFIX} {infoActivity.createdByEmail}
                </Text>
              )}
              <Text size="1" color="gray" as="p">
                {linkedEventCount(infoActivity.id)} {SCHEDULED_SUFFIX}
              </Text>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={calendarActivity !== null}
        onOpenChange={open => {
          if (!open) setCalendarActivity(null);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className={cn(
            'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
            FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
          )}
          style={{ maxWidth: 460 }}
        >
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            {ADD_TO_CALENDAR_DIALOG_TITLE}
          </DialogTitle>
          {calendarActivity && (
            <CalendarEventForm
              initialData={{
                title: calendarActivity.title,
                description: calendarActivity.description ?? '',
                start: new Date().toISOString(),
                end: new Date(
                  Date.now() + EVENT_DEFAULT_DURATION_MS,
                ).toISOString(),
                allDay: false,
                color: '',
              }}
              onSubmit={handleAddToCalendar}
              onCancel={() => setCalendarActivity(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
