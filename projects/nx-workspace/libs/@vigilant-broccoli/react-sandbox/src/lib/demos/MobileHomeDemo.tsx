import { useState } from 'react';
import {
  CalendarDays,
  CalendarPlus,
  CloudSun,
  House,
  LayoutGrid,
  Link2,
  ListTodo,
  LogOut,
  Menu,
  Rows3,
  StickyNote,
} from 'lucide-react';
import {
  OPEN_METEO_MAX_FORECAST_DAYS,
  OPEN_TYPE,
  type QuickLink,
} from '@vigilant-broccoli/common-js';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  VisuallyHidden,
} from '@vigilant-broccoli/react-lib';
import { WeatherClockCardUtilityContent } from '@vigilant-broccoli/react-utility';
import {
  CreateTasksDialog,
  GoogleTasksComponent,
  QuickLinksPanel,
  Sidebar,
  type SidebarCTA,
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

// iPhone 14/15 viewport (390x844 CSS px), shrinking on narrower windows. Like
// the real page, the frame never scrolls: the top bar stays put and each tab
// panel scrolls on its own. The transform makes the frame the containing block
// for the drawer's fixed backdrop.
const PHONE_FRAME_CLASS =
  'relative flex h-[844px] w-[390px] max-w-full flex-col overflow-hidden rounded-[2.5rem] border-8 border-gray-800 bg-gray-50 shadow-lg [transform:translateZ(0)] dark:border-gray-600';

// Same as Topbar in vb-manager-next-mobile; the safe-area inset is 0 here.
const TOPBAR_CLASS =
  'z-20 flex h-14 shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4';
const MENU_BUTTON_CLASS =
  'shrink-0 cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400';

// The app pins the drawer with fixed; here it is absolute inside the frame.
// md:!w-64 keeps the drawer expanded instead of the desktop icon rail.
const DRAWER_CLASS = 'absolute top-0 left-0 bottom-0 z-30 md:!w-64';
// Sidebar's own backdrop is md:hidden, so draw one for wide windows.
const DRAWER_BACKDROP_CLASS = 'absolute inset-0 z-20 bg-black/50 max-md:hidden';
const SIGN_OUT_ROW_CLASS =
  'm-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';

const APP_NAME = 'VB Manager';

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
const CREATE_EVENT_LABEL = 'Create calendar event';
const noop = () => undefined;

const MOCK_VOICE_TRANSCRIPT = 'Pick up the dry cleaning tomorrow at noon.';
const MOCK_EVENT_TRANSCRIPT = 'Dinner with Alex on Friday at 7pm.';

const VOICE_BUTTON_CLASS =
  'flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100';

// Stands in for the app's recorder-backed voice button: inserts a canned
// transcript instead of using the microphone.
const MockVoiceButton = ({
  transcript,
  onTranscript,
}: {
  transcript: string;
  onTranscript: (text: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onTranscript(transcript)}
    className={VOICE_BUTTON_CLASS}
  >
    Voice
  </button>
);

// Same layout as CalendarInput in vb-manager-next-mobile, without uploads,
// the microphone or the parse/create network calls.
const MockCalendarInput = () => {
  const [text, setText] = useState('');
  const [extracted, setExtracted] = useState(false);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste event text, email, or image here..."
        rows={4}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div className="flex gap-2">
        <button type="button" className={VOICE_BUTTON_CLASS}>
          Gallery
        </button>
        <button type="button" className={VOICE_BUTTON_CLASS}>
          Camera
        </button>
        <MockVoiceButton
          transcript={MOCK_EVENT_TRANSCRIPT}
          onTranscript={transcript =>
            setText(prev => (prev ? `${prev}\n${transcript}` : transcript))
          }
        />
      </div>
      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => setExtracted(true)}
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50"
      >
        Extract events
      </button>
      {extracted && (
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
          Event extraction is mocked in the component library.
        </p>
      )}
    </div>
  );
};

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
          renderVoiceAction={onTranscript => (
            <MockVoiceButton
              transcript={MOCK_VOICE_TRANSCRIPT}
              onTranscript={onTranscript}
            />
          )}
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const navItems: SidebarCTA[] = [
    { label: 'Home', icon: House, isActive: true, onClick: closeDrawer },
    { label: 'Apps', icon: LayoutGrid, onClick: closeDrawer },
  ];

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
      <header className={TOPBAR_CLASS}>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(open => !open)}
          className={MENU_BUTTON_CLASS}
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-800">{APP_NAME}</span>
      </header>

      <main className="flex min-h-0 flex-1 flex-col px-4 py-5">
        <TabbedView
          tabs={tabs}
          value={tab}
          onValueChange={setTab}
          actions={
            tab !== TAB.TASKS && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                aria-label={CREATE_EVENT_LABEL}
                title={CREATE_EVENT_LABEL}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
              >
                <CalendarPlus size={18} />
              </button>
            )
          }
        />
      </main>

      {drawerOpen && (
        <>
          <div className={DRAWER_BACKDROP_CLASS} onClick={closeDrawer} />
          <Sidebar
            items={navItems}
            className={DRAWER_CLASS}
            mobileOpen
            onMobileClose={closeDrawer}
            footer={
              <button
                type="button"
                onClick={closeDrawer}
                className={SIGN_OUT_ROW_CLASS}
              >
                <span className="shrink-0">
                  <LogOut size={18} />
                </span>
                <span className="flex-1 whitespace-nowrap">Sign out</span>
              </button>
            }
          />
        </>
      )}

      {/* Radix portals the dialog to the page, so it covers the whole window
          rather than just the phone frame. */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="block max-h-[90vh] w-[calc(100%-2rem)] max-w-[600px] gap-0 overflow-y-auto"
          aria-describedby={undefined}
          showCloseButton={false}
        >
          <VisuallyHidden>
            <DialogTitle>Create Calendar Event</DialogTitle>
          </VisuallyHidden>
          <MockCalendarInput />
        </DialogContent>
      </Dialog>
    </div>
  );
};
