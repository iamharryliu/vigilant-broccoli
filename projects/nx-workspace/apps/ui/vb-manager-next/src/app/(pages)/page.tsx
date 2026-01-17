'use client';

import { Card, Flex } from '@radix-ui/themes';
import { WeatherComponent } from '../components/weather.component';
import { ClockComponent } from '../components/clock.component';
import { GoogleTasksComponent } from '../components/google-tasks.component';
import { TaskListDebugComponent } from '../components/task-list-debug.component';
import { QuickLinksComponent } from '../components/quick-links.component';
import { UtilitiesComponent } from '../components/utilities.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';

const CALENDAR_CONFIG: Record<'personal' | 'work', CalendarConfig> = {
  personal: {
    height: 600,
    wkst: 2,
    ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
    showPrint: 0,
    mode: 'AGENDA',
    title: 'Personal Calendar',
    ownerCalendars: [
      {
        email: GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.GREEN,
      },
      {
        email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.RED,
      },
    ],
    sharedCalendars: [
      {
        id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.PURPLE,
      },
      {
        id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.PHASES_OF_THE_MOON,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_PINK,
      },
    ],
  },
  work: {
    height: 600,
    wkst: 2,
    ctz: GOOGLE_CALENDAR.TIMEZONE.STOCKHOLM,
    showPrint: 0,
    mode: 'AGENDA',
    ownerCalendars: [
      {
        email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.LIGHT_BLUE,
      },
    ],
    sharedCalendars: [
      {
        id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_GREEN,
      },
    ],
  },
};

export default function Page() {
  const { appMode } = useAppMode();

  return (
    <div className="grid grid-cols-4 gap-4 h-full mb-4">
      <>
        <div className="flex flex-col gap-4">
          <Card className="w-full">
            <Flex direction="column" gap="4" p="4">
              <ClockComponent />
              <WeatherComponent />
            </Flex>
          </Card>
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            {appMode === APP_MODE.PERSONAL ? (
              <iframe
                src={buildCalendarUrl(CALENDAR_CONFIG.personal)}
                className="w-full h-[600px] dark:invert dark:hue-rotate-180"
                style={{ minHeight: '400px' }}
              ></iframe>
            ) : (
              <iframe
                src={buildCalendarUrl(CALENDAR_CONFIG.work)}
                className="w-full h-[600px] dark:invert dark:hue-rotate-180"
                style={{ minHeight: '400px' }}
              />
            )}
          </div>
        </div>
      </>
      <div className="flex flex-col gap-4">
        {appMode === APP_MODE.PERSONAL ? (
          <GoogleTasksComponent />
        ) : (
          <GoogleTasksComponent taskListId="cXJUTkpUQzZ6bTBpQjNybA" />
        )}
        <TaskListDebugComponent />
      </div>
      <div className="flex flex-col gap-4">
        <UtilitiesComponent />
      </div>

      <div className="flex flex-col gap-4">
        <QuickLinksComponent />
      </div>
    </div>
  );
}
