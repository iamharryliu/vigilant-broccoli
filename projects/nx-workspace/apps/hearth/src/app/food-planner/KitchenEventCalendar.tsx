'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import {
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { CalendarEvent } from '../../lib/types';
import { CalendarView } from '../calendar/components/CalendarView';
import {
  CalendarEventForm,
  CalendarEventFormData,
} from '../calendar/components/CalendarEventForm';
import { MockMealList } from './MockMealList';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventReceiveArg = any;

const EVENTS_ENDPOINT = '/api/calendar/events';
const DROP_DURATION_HOURS = 1;

type CalendarModal =
  | { type: 'create'; start: string; end: string; allDay: boolean }
  | { type: 'edit'; event: CalendarEvent }
  | null;

type Props = {
  refreshSignal?: number;
  onChanged?: () => void;
};

function EventDialog({
  modal,
  onClose,
  onCreate,
  onEdit,
  onDelete,
}: {
  modal: CalendarModal;
  onClose: () => void;
  onCreate: (data: CalendarEventFormData) => void;
  onEdit: (data: CalendarEventFormData) => void;
  onDelete: () => void;
}) {
  return (
    <Dialog.Root
      open={modal !== null}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content
        className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
        style={{ maxWidth: 480 }}
      >
        <Dialog.Title>
          {modal?.type === 'edit' ? 'Edit Kitchen Event' : 'New Kitchen Event'}
        </Dialog.Title>

        {modal?.type === 'create' && (
          <CalendarEventForm
            initialData={{
              start: modal.start,
              end: modal.end,
              allDay: modal.allDay,
            }}
            onSubmit={onCreate}
            onCancel={onClose}
          />
        )}

        {modal?.type === 'edit' && (
          <>
            {modal.event.createdByEmail && (
              <Text size="1" color="gray">
                Created by {modal.event.createdByEmail}
              </Text>
            )}
            <CalendarEventForm
              initialData={{
                title: modal.event.title,
                description: modal.event.description ?? '',
                start: modal.event.start,
                end: modal.event.end,
                allDay: modal.event.allDay,
                color: modal.event.color ?? '',
              }}
              onSubmit={onEdit}
              onDelete={onDelete}
              onCancel={onClose}
              isEdit
            />
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function DropDialog({
  pendingDrop,
  onClose,
  onConfirm,
}: {
  pendingDrop: CalendarEventFormData | null;
  onClose: () => void;
  onConfirm: (data: CalendarEventFormData) => void;
}) {
  return (
    <Dialog.Root
      open={pendingDrop !== null}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content
        className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
        style={{ maxWidth: 460 }}
      >
        <Dialog.Title>Plan Meal</Dialog.Title>
        <Text size="2" color="gray" as="p" mb="3">
          Confirm the details before adding to your calendar.
        </Text>
        {pendingDrop && (
          <CalendarEventForm
            initialData={pendingDrop}
            onSubmit={onConfirm}
            onCancel={onClose}
          />
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function KitchenEventCalendar({ refreshSignal, onChanged }: Props) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modal, setModal] = useState<CalendarModal>(null);
  const [pendingDrop, setPendingDrop] = useState<CalendarEventFormData | null>(
    null,
  );

  const token = session?.access_token ?? '';
  const authHeader = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  const fetchEvents = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${EVENTS_ENDPOINT}?homeId=${homeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const rows: CalendarEvent[] = Array.isArray(data) ? data : [];
    setEvents(rows.filter(e => e.kitchenEvent));
  }, [homeId, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, refreshSignal]);

  const afterChange = () => {
    fetchEvents();
    onChanged?.();
  };

  const mutate = async (method: string, body: Record<string, unknown>) => {
    setModal(null);
    await fetch(EVENTS_ENDPOINT, {
      method,
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    afterChange();
  };

  const handleCreate = (data: CalendarEventFormData) =>
    mutate('POST', { ...data, homeId, kitchenEvent: true });

  const handleEdit = (data: CalendarEventFormData) => {
    if (modal?.type !== 'edit') return;
    mutate('PATCH', { id: modal.event.id, ...data });
  };

  const handleDelete = () => {
    if (modal?.type !== 'edit') return;
    mutate('DELETE', { id: modal.event.id });
  };

  const handleDrop = (
    id: string,
    start: string,
    end: string,
    allDay: boolean,
  ) => mutate('PATCH', { id, start, end, allDay });

  const handleEventReceive = (arg: EventReceiveArg) => {
    arg.revert();
    const start = arg.event.startStr;
    const allDay = arg.event.allDay;
    const endDate = new Date(start);
    endDate.setHours(endDate.getHours() + DROP_DURATION_HOURS);
    setPendingDrop({
      title: arg.event.title,
      description: arg.event.extendedProps.description ?? '',
      start,
      end: allDay ? arg.event.endStr || start : endDate.toISOString(),
      allDay,
      color: '',
    });
  };

  const handleConfirmDrop = async (data: CalendarEventFormData) => {
    setPendingDrop(null);
    await mutate('POST', { ...data, homeId, kitchenEvent: true });
  };

  if (!homeId) return null;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
      <MockMealList />

      <div className="flex flex-col gap-4">
        <CalendarView
          events={events}
          onSelectSlot={(start, end, allDay) =>
            setModal({ type: 'create', start, end, allDay })
          }
          onEventClick={event => setModal({ type: 'edit', event })}
          onEventDrop={handleDrop}
          onEventReceive={handleEventReceive}
          droppable
          height="70vh"
        />
      </div>

      <EventDialog
        modal={modal}
        onClose={() => setModal(null)}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DropDialog
        pendingDrop={pendingDrop}
        onClose={() => setPendingDrop(null)}
        onConfirm={handleConfirmDrop}
      />
    </div>
  );
}
