'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarListView, Text } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { CalendarEvent } from '../../lib/types';
import { useTranslation } from '../i18n';

type Props = {
  refreshSignal?: number;
  className?: string;
};

export function ActivityEvents({ refreshSignal, className }: Props) {
  const { t } = useTranslation();
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
    setEvents(rows.filter(e => e.leisureActivityId));
    setIsLoading(false);
  }, [homeId, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, refreshSignal]);

  return (
    <CalendarListView
      events={events}
      loading={isLoading}
      className={className}
      emptyContent={
        <Text size="2" color="gray">
          {t('ACTIVITY_PLANNER.EMPTY_EVENTS')}
        </Text>
      }
    />
  );
}
