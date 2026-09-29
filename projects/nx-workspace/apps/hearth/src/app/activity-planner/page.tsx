'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, CardContainer, Text } from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from '../i18n';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { CalendarEvent, LeisureActivity } from '../../lib/types';
import { LeisureList } from '../leisure/components/LeisureList';
import { LeisureActivityFormData } from '../leisure/components/LeisureActivityForm';
import { CalendarEventFormData } from '../calendar/components/CalendarEventForm';
import { ActivityNotes } from './ActivityNotes';
import { ActivityEvents } from './ActivityEvents';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

const LEISURE_ENDPOINT = '/api/leisure';
const CALENDAR_EVENTS_ENDPOINT = '/api/calendar/events';
const ADD_LABEL = '+ Add';

function ActivityPlannerContent() {
  const { t } = useTranslation();
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [activities, setActivities] = useState<LeisureActivity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [addSignal, setAddSignal] = useState(0);
  const [eventsRefresh, setEventsRefresh] = useState(0);

  const token = session?.access_token ?? '';
  const authHeader = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  const fetchActivities = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${LEISURE_ENDPOINT}?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setActivities(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  const fetchCalendarEvents = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${CALENDAR_EVENTS_ENDPOINT}?homeId=${homeId}`, {
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
    await fetch(LEISURE_ENDPOINT, {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    fetchActivities();
  };

  const handleEdit = async (id: string, data: LeisureActivityFormData) => {
    await fetch(LEISURE_ENDPOINT, {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, ...data }),
    });
    fetchActivities();
  };

  const handleDelete = async (id: string) => {
    await fetch(LEISURE_ENDPOINT, {
      method: 'DELETE',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    fetchActivities();
  };

  const handleAddToCalendar = async (
    activityId: string,
    data: CalendarEventFormData,
  ) => {
    await fetch(CALENDAR_EVENTS_ENDPOINT, {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId, leisureActivityId: activityId }),
    });
    fetchCalendarEvents();
    setEventsRefresh(n => n + 1);
  };

  return (
    <div className="flex h-[calc(100dvh_-_var(--topbar-h)_-_3rem)] w-full flex-col p-4 sm:p-6 md:px-8 md:py-8">
      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="flex min-h-0 flex-col lg:overflow-y-auto">
          <CardContainer
            title={t('ACTIVITY_PLANNER.COLUMNS.ACTIVITY_LIST')}
            headerAction={
              <Button
                onClick={() => setAddSignal(n => n + 1)}
                className="cursor-pointer"
              >
                {ADD_LABEL}
              </Button>
            }
          >
            <LeisureList
              hideTitle
              hideDragHint
              addSignal={addSignal}
              activities={activities}
              calendarEvents={calendarEvents}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddToCalendar={handleAddToCalendar}
            />
          </CardContainer>
        </div>

        <div className="min-h-0 lg:h-full">
          <ActivityNotes />
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <Text size="5" weight="bold">
            {t('ACTIVITY_PLANNER.COLUMNS.ACTIVITY_EVENTS')}
          </Text>
          <ActivityEvents
            refreshSignal={eventsRefresh}
            className="min-h-0 flex-1 overflow-y-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default function ActivityPlannerPage() {
  usePageTitle(PAGE_TITLES.ACTIVITY_PLANNER);
  return (
    <I18nProvider>
      <ActivityPlannerContent />
    </I18nProvider>
  );
}
