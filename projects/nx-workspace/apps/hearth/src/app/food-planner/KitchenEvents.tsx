'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarListView, Text } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { CalendarEvent } from '../../lib/types';

const EMPTY_TEXT = 'No kitchen events yet';

type Props = {
  refreshSignal?: number;
};

export function KitchenEvents({ refreshSignal }: Props) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = session?.access_token ?? '';

  const fetchEvents = useCallback(async () => {
    if (!homeId || !token) return;
    setIsLoading(true);
    const res = await fetch(`/api/calendar/events?homeId=${homeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const rows: CalendarEvent[] = Array.isArray(data) ? data : [];
    setEvents(rows.filter(e => e.kitchenEvent));
    setIsLoading(false);
  }, [homeId, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, refreshSignal]);

  return (
    <CalendarListView
      events={events}
      loading={isLoading}
      emptyContent={
        <Text size="2" color="gray">
          {EMPTY_TEXT}
        </Text>
      }
    />
  );
}
