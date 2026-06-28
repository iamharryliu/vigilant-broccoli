'use client';

import { useCallback, useEffect, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventReceiveArg = any;
import { Dialog, Text } from '@radix-ui/themes';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { CalendarEvent, Meal } from '../../lib/types';
import { CalendarView } from '../calendar/components/CalendarView';
import {
  CalendarEventForm,
  CalendarEventFormData,
} from '../calendar/components/CalendarEventForm';
import { MealList } from './components/MealList';
import { MealCalendarDropForm } from './components/MealCalendarDropForm';
import { MealFormData } from './components/MealForm';

type PendingDrop = CalendarEventFormData & { mealId?: string };

type CalendarModal =
  | { type: 'create'; start: string; end: string; allDay: boolean }
  | { type: 'edit'; event: CalendarEvent }
  | null;

export default function MealsPage() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [calendarModal, setCalendarModal] = useState<CalendarModal>(null);

  const token = session?.access_token ?? '';
  const authHeader = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  const fetchMeals = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/meals?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setMeals(Array.isArray(data) ? data : []);
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
    fetchMeals();
    fetchCalendarEvents();
  }, [fetchMeals, fetchCalendarEvents]);

  const handleAdd = async (data: MealFormData) => {
    await fetch('/api/meals', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    fetchMeals();
  };

  const handleEdit = async (id: string, data: MealFormData) => {
    await fetch('/api/meals', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, ...data }),
    });
    fetchMeals();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/meals', {
      method: 'DELETE',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    fetchMeals();
  };

  const handleEventReceive = (arg: EventReceiveArg) => {
    arg.revert();
    const start = arg.event.startStr;
    const allDay = arg.event.allDay;
    const endDate = new Date(start);
    endDate.setHours(endDate.getHours() + 1);

    setPendingDrop({
      title: arg.event.title,
      description: arg.event.extendedProps.description ?? '',
      start,
      end: allDay ? arg.event.endStr || start : endDate.toISOString(),
      allDay,
      color: '',
      mealId: arg.event.extendedProps.mealId,
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
        mealId: pendingDrop?.mealId ?? null,
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
        Meal Planning
      </Text>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <MealList
          meals={meals}
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

      <Dialog.Root
        open={pendingDrop !== null}
        onOpenChange={open => {
          if (!open) setPendingDrop(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 460 }}>
          <Dialog.Title>Plan Meal</Dialog.Title>
          <Text size="2" color="gray" as="p" mb="3">
            Confirm the details before adding to your calendar.
          </Text>
          {pendingDrop && (
            <MealCalendarDropForm
              initialData={pendingDrop}
              onConfirm={handleConfirmDrop}
              onCancel={() => setPendingDrop(null)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

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
            <>
              {calendarModal.event.createdByEmail && (
                <Text size="1" color="gray">
                  Created by {calendarModal.event.createdByEmail}
                </Text>
              )}
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
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
