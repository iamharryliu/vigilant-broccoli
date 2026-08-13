'use client';

import { useCallback, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import type { EventInput } from '@fullcalendar/core';
import { Text } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { CalendarEvent } from '../../lib/types';

const LIST_VIEW = 'listMonth';

const toFullCalendarEvent = (e: CalendarEvent): EventInput => ({
  id: e.id,
  title: e.title,
  start: e.start,
  end: e.end,
  allDay: e.allDay,
  backgroundColor: e.color ?? undefined,
  borderColor: e.color ?? undefined,
});

export function FoodCalendar() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const token = session?.access_token ?? '';

  const fetchEvents = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/calendar/events?homeId=${homeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const rows: CalendarEvent[] = Array.isArray(data) ? data : [];
    setEvents(rows.filter(e => e.mealId));
  }, [homeId, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <FullCalendar
      plugins={[listPlugin]}
      initialView={LIST_VIEW}
      headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
      height="auto"
      events={events.map(toFullCalendarEvent)}
      noEventsContent={() => (
        <Text size="2" color="gray">
          No meals planned yet
        </Text>
      )}
    />
  );
}
