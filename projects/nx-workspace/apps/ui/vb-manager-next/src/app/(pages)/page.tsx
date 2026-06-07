'use client';

import { TaskListSelectorComponent } from '../components/task-list-selector.component';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';

const BIRTHDAYS_CALENDAR =
  'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com';

const CALENDAR_CONFIG: CalendarConfig = {
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
    {
      id: BIRTHDAYS_CALENDAR,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.BLUE,
    },
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.H_AND_K,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.PINK,
    },
  ],
};

export default function Page() {
  return (
    <div className="grid grid-cols-2 gap-4 h-full mb-4">
      <div className="flex flex-col h-full">
        <TaskListSelectorComponent />
      </div>
      <div className="flex flex-col h-full">
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden h-full">
          <iframe
            src={buildCalendarUrl(CALENDAR_CONFIG)}
            className="w-full h-full dark:invert dark:hue-rotate-180"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    </div>
  );
}
