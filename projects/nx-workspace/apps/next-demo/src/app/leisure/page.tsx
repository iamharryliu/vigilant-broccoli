'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventReceiveArg = any;
import { Dialog, Text } from '@radix-ui/themes';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { CalendarEvent, LeisureActivity } from '../../lib/types';
import { CalendarView } from '../calendar/components/CalendarView';
import {
  CalendarEventForm,
  CalendarEventFormData,
} from '../calendar/components/CalendarEventForm';
import { LeisureList } from './components/LeisureList';
import { LeisureCalendarDropForm } from './components/LeisureCalendarDropForm';
import { LeisureActivityFormData } from './components/LeisureActivityForm';

type PendingDrop = CalendarEventFormData & { leisureId?: string };

type CalendarModal =
  | { type: 'create'; start: string; end: string; allDay: boolean }
  | { type: 'edit'; event: CalendarEvent }
  | null;

export default function LeisurePage() {
  const router = useRouter();
  const session = useAuth();
  const [homeId, setHomeId] = useState<number | null>(null);
  const [activities, setActivities] = useState<LeisureActivity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [calendarModal, setCalendarModal] = useState<CalendarModal>(null);

  const token = session?.access_token ?? '';
  const authHeader = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  useEffect(() => {
    supabase
      .from('homes')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) {
          router.replace(ROUTES.HOMES);
          return;
        }
        setHomeId(data.id);
      });
  }, [router]);

  const fetchActivities = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/leisure?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setActivities(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  const fetchCalendarEvents = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/calendar/events?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setCalendarEvents(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  useEffect(() => {
    fetchActivities();
    fetchCalendarEvents();
  }, [fetchActivities, fetchCalendarEvents]);

  const handleAdd = async (data: LeisureActivityFormData) => {
    await fetch('/api/leisure', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    fetchActivities();
  };

  const handleEdit = async (id: string, data: LeisureActivityFormData) => {
    await fetch('/api/leisure', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, ...data }),
    });
    fetchActivities();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/leisure', {
      method: 'DELETE',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    fetchActivities();
  };

  const handleEventReceive = (arg: EventReceiveArg) => {
    arg.revert();
    const start = arg.event.startStr;
    const allDay = arg.event.allDay;
    const endDate = new Date(start);
    endDate.setHours(endDate.getHours() + 2);

    setPendingDrop({
      title: arg.event.title,
      description: arg.event.extendedProps.description ?? '',
      start,
      end: allDay ? arg.event.endStr || start : endDate.toISOString(),
      allDay,
      color: '',
      leisureId: arg.event.extendedProps.leisureId,
    });
  };

  const handleEventDrop = async (
    id: string,
    start: string,
    end: string,
    allDay: boolean,
  ) => {
    await fetch('/api/calendar/events', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, start, end, allDay }),
    });
    fetchCalendarEvents();
  };

  const handleConfirmDrop = async (data: CalendarEventFormData) => {
    await fetch('/api/calendar/events', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...data,
        homeId,
        leisureActivityId: pendingDrop?.leisureId ?? null,
      }),
    });
    setPendingDrop(null);
    fetchCalendarEvents();
  };

  const handleCalendarCreate = async (data: CalendarEventFormData) => {
    await fetch('/api/calendar/events', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    setCalendarModal(null);
    fetchCalendarEvents();
  };

  const handleCalendarEdit = async (data: CalendarEventFormData) => {
    if (calendarModal?.type !== 'edit') return;
    await fetch('/api/calendar/events', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: calendarModal.event.id, ...data }),
    });
    setCalendarModal(null);
    fetchCalendarEvents();
  };

  const handleCalendarDelete = async () => {
    if (calendarModal?.type !== 'edit') return;
    await fetch('/api/calendar/events', {
      method: 'DELETE',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: calendarModal.event.id }),
    });
    setCalendarModal(null);
    fetchCalendarEvents();
  };

  if (!homeId) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Text size="6" weight="bold">
        Leisure
      </Text>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <LeisureList
          activities={activities}
          calendarEvents={calendarEvents}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <CalendarView
          events={calendarEvents}
          onSelectSlot={(start, end, allDay) =>
            setCalendarModal({ type: 'create', start, end, allDay })
          }
          onEventClick={event => setCalendarModal({ type: 'edit', event })}
          onEventDrop={handleEventDrop}
          onEventReceive={handleEventReceive}
          droppable
          showViewSwitcher={false}
          height="70vh"
        />
      </div>

      {/* Drag-to-schedule confirmation */}
      <Dialog.Root
        open={pendingDrop !== null}
        onOpenChange={open => {
          if (!open) setPendingDrop(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 460 }}>
          <Dialog.Title>Schedule Activity</Dialog.Title>
          <Text size="2" color="gray" as="p" mb="3">
            Confirm the details before adding to your calendar.
          </Text>
          {pendingDrop && (
            <LeisureCalendarDropForm
              initialData={pendingDrop}
              onConfirm={handleConfirmDrop}
              onCancel={() => setPendingDrop(null)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* Calendar event create/edit */}
      <Dialog.Root
        open={calendarModal !== null}
        onOpenChange={open => {
          if (!open) setCalendarModal(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>
            {calendarModal?.type === 'edit' ? 'Edit Event' : 'New Event'}
          </Dialog.Title>

          {calendarModal?.type === 'create' && (
            <CalendarEventForm
              initialData={{
                start: calendarModal.start,
                end: calendarModal.end,
                allDay: calendarModal.allDay,
              }}
              onSubmit={handleCalendarCreate}
              onCancel={() => setCalendarModal(null)}
            />
          )}

          {calendarModal?.type === 'edit' && (
            <CalendarEventForm
              initialData={{
                title: calendarModal.event.title,
                description: calendarModal.event.description ?? '',
                start: calendarModal.event.start,
                end: calendarModal.event.end,
                allDay: calendarModal.event.allDay,
                color: calendarModal.event.color ?? '',
              }}
              onSubmit={handleCalendarEdit}
              onDelete={handleCalendarDelete}
              onCancel={() => setCalendarModal(null)}
              isEdit
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
