import { useState } from 'react';
import {
  CalendarDays,
  CloudSun,
  Link2,
  ListTodo,
  Rows3,
  StickyNote,
} from 'lucide-react';
import {
  OPEN_METEO_MAX_FORECAST_DAYS,
  OPEN_TYPE,
  type QuickLink,
} from '@vigilant-broccoli/common-js';
import { IconButton } from '@vigilant-broccoli/react-lib';
import { WeatherClockCardUtilityContent } from '@vigilant-broccoli/react-utility';
import {
  CreateTasksDialog,
  GoogleTasksComponent,
  QuickLinksPanel,
} from '@vigilant-broccoli/react-lib-higher-level';
import {
  CalendarAgenda,
  EventCalendarsList,
  TabbedView,
  type CalendarEvent,
  type EventCalendarLink,
  type TabbedViewTab,
} from '@vigilant-broccoli/react-lib-higher-level';
import { NotepadDemo } from './NotepadDemo';
import { SCENARIO, useMockTasksAuth } from './TasksDemo';
import {
  buildWeather,
  DEMO_LOCATION,
  DEMO_TIMEZONE_OFFSET_SECONDS,
} from './WeatherClockCardDemo';

const TAB = {
  CALENDAR: 'Calendar',
  EVENT_CALENDARS: 'Event Calendars',
  TASKS: 'Tasks',
  NOTEPAD: 'Notepad',
  QUICK_LINKS: 'Quick Links',
  WEATHER: 'Weather',
} as const;

type Tab = (typeof TAB)[keyof typeof TAB];

const TAB_ICON_SIZE = 18;

// iPhone 14/15 viewport (390x844 CSS px); the frame scrolls like the phone
// screen does and shrinks on narrower windows. Padding and background match
// the real page shell (page.tsx in vb-manager-next-mobile).
const PHONE_FRAME_CLASS =
  'h-[844px] w-[390px] max-w-full overflow-y-auto rounded-[2.5rem] border-8 border-gray-800 bg-gray-50 px-4 py-5 shadow-lg dark:border-gray-600';

const PHONE_HEIGHT_PX = 844;
const PHONE_BORDER_PX = 8;

// Same rule as NOTEPAD_HEIGHT in home-view.tsx: the screen minus the 3.5rem
// top bar and the tab row/padding (8rem), with the frame's inner height
// standing in for the viewport.
const NOTEPAD_STYLE = {
  height: `calc(${PHONE_HEIGHT_PX - PHONE_BORDER_PX * 2}px - 3.5rem - 8rem)`,
} as const;

const NOTEPAD_SAMPLE = `Groceries
- eggs
- spinach
- oat milk

Call the dentist on Monday.
Ideas: plan the weekend trip, book a table for Sam's birthday.`;

const CALENDAR_ID = {
  PERSONAL: 'personal@example.com',
  WORK: 'work@example.com',
  MEETUPS: 'meetups@example.com',
  HOLIDAYS: 'holidays@example.com',
} as const;

const EVENT_CALENDARS: EventCalendarLink[] = [
  {
    id: 'personal',
    name: 'Personal',
    googleCalendarId: CALENDAR_ID.PERSONAL,
    url: 'https://calendar.google.com/calendar/u/0?cid=personal',
  },
  {
    id: 'work',
    name: 'Work',
    googleCalendarId: CALENDAR_ID.WORK,
    url: 'https://calendar.google.com/calendar/u/0?cid=work',
  },
  {
    id: 'meetups',
    name: 'Meetups',
    googleCalendarId: CALENDAR_ID.MEETUPS,
    url: 'https://calendar.google.com/calendar/u/0?cid=meetups',
  },
  {
    id: 'holidays',
    name: 'Holidays',
    googleCalendarId: CALENDAR_ID.HOLIDAYS,
    url: 'https://calendar.google.com/calendar/u/0?cid=holidays',
  },
];

const COLOR_BY_CALENDAR_ID = new Map<string, string>([
  [CALENDAR_ID.PERSONAL, '#3b82f6'],
  [CALENDAR_ID.WORK, '#10b981'],
  [CALENDAR_ID.MEETUPS, '#f59e0b'],
  [CALENDAR_ID.HOLIDAYS, '#ef4444'],
]);

const dayOffset = (days: number, hour = 0, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const mockEvent = (
  id: string,
  calendarId: string,
  summary: string,
  start: string,
  end: string,
  allDay = false,
): CalendarEvent => ({ id, calendarId, summary, start, end, allDay });

// Relative to today so the agenda always has a Today group and a "now" line.
const buildMockEvents = (): CalendarEvent[] => [
  mockEvent(
    'holiday',
    CALENDAR_ID.HOLIDAYS,
    'Public holiday',
    dayOffset(0),
    dayOffset(1),
    true,
  ),
  mockEvent(
    'standup',
    CALENDAR_ID.WORK,
    'Team stand-up',
    dayOffset(0, 9, 30),
    dayOffset(0, 10),
  ),
  mockEvent(
    'lunch',
    CALENDAR_ID.PERSONAL,
    'Lunch with Sam',
    dayOffset(0, 12, 15),
    dayOffset(0, 13, 15),
  ),
  mockEvent(
    'review',
    CALENDAR_ID.WORK,
    'Design review',
    dayOffset(0, 16),
    dayOffset(0, 17),
  ),
  mockEvent(
    'dentist',
    CALENDAR_ID.PERSONAL,
    'Dentist appointment',
    dayOffset(1, 8, 45),
    dayOffset(1, 9, 30),
  ),
  mockEvent(
    'meetup',
    CALENDAR_ID.MEETUPS,
    'React meetup',
    dayOffset(1, 18, 30),
    dayOffset(1, 20, 30),
  ),
  mockEvent(
    'trip',
    CALENDAR_ID.PERSONAL,
    'Weekend trip',
    dayOffset(3),
    dayOffset(5),
    true,
  ),
  mockEvent(
    'planning',
    CALENDAR_ID.WORK,
    'Quarterly planning',
    dayOffset(4, 10),
    dayOffset(4, 12),
  ),
];

const MOCK_QUICK_LINKS: QuickLink[] = [
  {
    label: 'GitHub',
    target: 'https://github.com',
    type: OPEN_TYPE.BROWSER,
    subgroup: 'Dev',
  },
  {
    label: 'Google Drive',
    target: 'https://drive.google.com',
    type: OPEN_TYPE.BROWSER,
    subgroup: 'Utility',
  },
  {
    label: 'YouTube',
    target: 'https://www.youtube.com',
    type: OPEN_TYPE.BROWSER,
    subgroup: 'Leisure',
  },
];

const WEATHER_FORECAST_DAYS = OPEN_METEO_MAX_FORECAST_DAYS;

const CREATE_TASKS_LABEL = 'Create tasks';
const noop = () => undefined;

// Mirrors GoogleTasksView in vb-manager-next-mobile, on the mocked tasks API.
const MobileTasks = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { auth } = useMockTasksAuth(SCENARIO.SIGNED_IN, false, noop);

  return (
    <GoogleTasksComponent
      auth={auth}
      showSelector
      wrapInCard={false}
      refreshTrigger={refreshTrigger}
      addTaskActions={
        <CreateTasksDialog
          trigger={
            <IconButton
              icon="bot"
              variant="outline"
              aria-label={CREATE_TASKS_LABEL}
            />
          }
          auth={auth}
          onCreated={() => setRefreshTrigger(n => n + 1)}
        />
      }
    />
  );
};

export const MobileHomeDemo = () => {
  const [tab, setTab] = useState<Tab>(TAB.CALENDAR);
  const [events] = useState(buildMockEvents);
  const [weather] = useState(() => buildWeather(WEATHER_FORECAST_DAYS));
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const toggleHidden = (googleCalendarId: string) =>
    setHiddenIds(current => {
      const next = new Set(current);
      if (!next.delete(googleCalendarId)) next.add(googleCalendarId);
      return next;
    });

  const tabs: TabbedViewTab<Tab>[] = [
    {
      value: TAB.CALENDAR,
      label: TAB.CALENDAR,
      icon: <CalendarDays size={TAB_ICON_SIZE} />,
      forceMount: true,
      content: (
        <CalendarAgenda
          events={events}
          hiddenIds={hiddenIds}
          colorByCalendarId={COLOR_BY_CALENDAR_ID}
        />
      ),
    },
    {
      value: TAB.EVENT_CALENDARS,
      label: TAB.EVENT_CALENDARS,
      icon: <Rows3 size={TAB_ICON_SIZE} />,
      content: (
        <EventCalendarsList
          calendars={EVENT_CALENDARS}
          error={false}
          hiddenIds={hiddenIds}
          onToggleHidden={toggleHidden}
        />
      ),
    },
    {
      value: TAB.TASKS,
      label: TAB.TASKS,
      icon: <ListTodo size={TAB_ICON_SIZE} />,
      content: <MobileTasks />,
    },
    {
      value: TAB.NOTEPAD,
      label: TAB.NOTEPAD,
      icon: <StickyNote size={TAB_ICON_SIZE} />,
      content: (
        <NotepadDemo initialContent={NOTEPAD_SAMPLE} style={NOTEPAD_STYLE} />
      ),
    },
    {
      value: TAB.QUICK_LINKS,
      label: TAB.QUICK_LINKS,
      icon: <Link2 size={TAB_ICON_SIZE} />,
      content: <QuickLinksPanel links={MOCK_QUICK_LINKS} />,
    },
    {
      value: TAB.WEATHER,
      label: TAB.WEATHER,
      icon: <CloudSun size={TAB_ICON_SIZE} />,
      content: (
        <div className="mx-auto w-full max-w-xl">
          <WeatherClockCardUtilityContent
            location={DEMO_LOCATION}
            timezoneOffsetSeconds={DEMO_TIMEZONE_OFFSET_SECONDS}
            weather={weather}
          />
        </div>
      ),
    },
  ];

  return (
    <div className={PHONE_FRAME_CLASS}>
      <TabbedView tabs={tabs} value={tab} onValueChange={setTab} />
    </div>
  );
};
