'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, Flex, Text } from '@radix-ui/themes';
import { useAuth } from '../../../providers/auth-provider';
import { ROUTES } from '../../../../lib/routes';
import { CalendarEvent } from '../../../../lib/types';
import { CalendarView } from '../../../calendar/components/CalendarView';
import {
  CalendarEventForm,
  CalendarEventFormData,
} from '../../../calendar/components/CalendarEventForm';

type ModalState =
  | { type: 'create'; start: string; end: string; allDay: boolean }
  | { type: 'edit'; event: CalendarEvent }
  | null;

export default function HomeCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const homeId = Number(id);
  const router = useRouter();
  const session = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modal, setModal] = useState<ModalState>(null);

  const token = session?.access_token ?? '';
  const authHeader = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`/api/calendar/events?homeId=${homeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (data: CalendarEventFormData) => {
    await fetch('/api/calendar/events', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    setModal(null);
    fetchEvents();
  };

  const handleEdit = async (data: CalendarEventFormData) => {
    if (modal?.type !== 'edit') return;
    await fetch('/api/calendar/events', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: modal.event.id, ...data }),
    });
    setModal(null);
    fetchEvents();
  };

  const handleDelete = async () => {
    if (modal?.type !== 'edit') return;
    await fetch('/api/calendar/events', {
      method: 'DELETE',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: modal.event.id }),
    });
    setModal(null);
    fetchEvents();
  };

  const handleEventDrop = async (
    evId: string,
    start: string,
    end: string,
    allDay: boolean,
  ) => {
    await fetch('/api/calendar/events', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: evId, start, end, allDay }),
    });
    fetchEvents();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <Flex align="center" gap="4">
        <button
          onClick={() => router.push(`${ROUTES.HOMES}/${id}`)}
          className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
        >
          ← Home
        </button>
        <Text size="6" weight="bold">
          Calendar
        </Text>
      </Flex>

      <CalendarView
        events={events}
        onSelectSlot={(start, end, allDay) =>
          setModal({ type: 'create', start, end, allDay })
        }
        onEventClick={event => setModal({ type: 'edit', event })}
        onEventDrop={handleEventDrop}
      />

      <Dialog.Root
        open={modal !== null}
        onOpenChange={open => {
          if (!open) setModal(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>
            {modal?.type === 'edit' ? 'Edit Event' : 'New Event'}
          </Dialog.Title>

          {modal?.type === 'create' && (
            <CalendarEventForm
              initialData={{
                start: modal.start,
                end: modal.end,
                allDay: modal.allDay,
              }}
              onSubmit={handleCreate}
              onCancel={() => setModal(null)}
            />
          )}

          {modal?.type === 'edit' && (
            <CalendarEventForm
              initialData={{
                title: modal.event.title,
                description: modal.event.description ?? '',
                start: modal.event.start,
                end: modal.event.end,
                allDay: modal.event.allDay,
                color: modal.event.color ?? '',
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
