'use client';

import { WeatherComponent } from '../components/weather.component';
import { ClockComponent } from '../components/clock.component';
import { GoogleTasksComponent } from '../components/google-tasks.component';
import { TaskListDebugComponent } from '../components/task-list-debug.component';
import { DjDownloadComponent } from '../components/dj-download.component';
import { LinkGroupComponent } from '../components/link-group.component';
import { RecipeScraperComponent } from '../components/recipe-scraper.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import CookingCalculatorCard from '../../components/CookingCalculatorCard';
import {
  GOOGLE_SERVICES,
  OPEN_TYPE,
  UTILITY_URL,
} from '@vigilant-broccoli/common-js';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';
import {
  JOURNAL_PATH,
  MAC_OS_APP,
  PERSONAL_URL,
  VB_REPO_PATH,
} from '@vigilant-broccoli/personal-common-js';

const UTILITY_LINKS = [
  {
    label: GOOGLE_SERVICES.PHOTOS.NAME,
    target: GOOGLE_SERVICES.PHOTOS.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: GOOGLE_SERVICES.CONTACTS.NAME,
    target: GOOGLE_SERVICES.CONTACTS.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: GOOGLE_SERVICES.DRIVE.NAME,
    target: GOOGLE_SERVICES.DRIVE.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: GOOGLE_SERVICES.MAPS.NAME,
    target: GOOGLE_SERVICES.MAPS.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: GOOGLE_SERVICES.TRANSLATE.NAME,
    target: GOOGLE_SERVICES.TRANSLATE.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: UTILITY_URL.CHATGPT.NAME,
    target: UTILITY_URL.CHATGPT.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: UTILITY_URL.CLAUDE.NAME,
    target: UTILITY_URL.CLAUDE.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: UTILITY_URL.FIND_MY.NAME,
    target: UTILITY_URL.FIND_MY.URL,
    type: OPEN_TYPE.BROWSER,
  },
];

const QUICK_LINKS = [
  {
    label: GOOGLE_SERVICES.GMAIL.NAME,
    target: GOOGLE_SERVICES.GMAIL.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: GOOGLE_SERVICES.CALENDAR.NAME,
    target: GOOGLE_SERVICES.CALENDAR.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: GOOGLE_SERVICES.MEET.NAME,
    target: GOOGLE_SERVICES.MEET.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: UTILITY_URL.AMAZON.NAME,
    target: UTILITY_URL.AMAZON.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: GOOGLE_SERVICES.YOUTUBE.NAME,
    target: GOOGLE_SERVICES.YOUTUBE.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: UTILITY_URL.PINTEREST.NAME,
    target: UTILITY_URL.PINTEREST.URL,
    type: OPEN_TYPE.BROWSER,
  },

  ...UTILITY_LINKS.map(link => ({ ...link, subgroup: 'Utility' })),
];

const CAREER_LINKS = [
  {
    label: PERSONAL_URL.RESUME.NAME,
    target: PERSONAL_URL.RESUME.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'LinkedIn',
    target: 'https://www.linkedin.com',
    type: OPEN_TYPE.BROWSER,
  },
];

const LEISURE_LINKS = [
  {
    label: MAC_OS_APP.SPOTIFY.NAME,
    target: MAC_OS_APP.SPOTIFY.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
  },
  {
    label: 'Manga',
    target: ' https://ww2.mangafreak.me/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: PERSONAL_URL.TO_DRAW.NAME,
    target: PERSONAL_URL.TO_DRAW.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: PERSONAL_URL.TO_READ.NAME,
    target: PERSONAL_URL.TO_READ.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: PERSONAL_URL.TO_WATCH_ANIME.NAME,
    target: PERSONAL_URL.TO_WATCH_ANIME.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: PERSONAL_URL.TO_WATCH_MOVIES_SHOWS.NAME,
    target: PERSONAL_URL.TO_WATCH_MOVIES_SHOWS.URL,
    type: OPEN_TYPE.BROWSER,
  },
];

const LEARN_LINKS = [
  {
    label: 'Udemy',
    target: 'https://www.udemy.com/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Memrise',
    target: 'https://app.memrise.com/dashboard',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Memrise (Community Version)',
    target: 'https://community-courses.memrise.com/dashboard',
    type: OPEN_TYPE.BROWSER,
  },
];

const FOR_LATER_LINKS = [
  {
    label: 'TODO(Journal)',
    target: JOURNAL_PATH.TODO,
    type: OPEN_TYPE.VSCODE,
  },
  {
    label: 'TODO(vigilant-broccoli)',
    target: VB_REPO_PATH.TODO,
    type: OPEN_TYPE.VSCODE,
  },
  {
    label: 'YouTube Watch Later',
    target: 'https://www.youtube.com/playlist?list=WL',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: PERSONAL_URL.INSTAGRAM_SAVED.NAME,
    target: PERSONAL_URL.INSTAGRAM_SAVED.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: PERSONAL_URL.REDDIT_SAVED.NAME,
    target: PERSONAL_URL.REDDIT_SAVED.URL,
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Expiration',
    target: JOURNAL_PATH.EXPIRATION,
    type: OPEN_TYPE.VSCODE,
  },
];

const PERSONAL_LINKS = [
  ...[
    {
      label: 'Food',
      target: JOURNAL_PATH.FOOD,
      type: OPEN_TYPE.VSCODE,
    },
    {
      label: PERSONAL_URL.GROCERIES.NAME,
      target: PERSONAL_URL.GROCERIES.URL,
      type: OPEN_TYPE.BROWSER,
    },
    {
      label: PERSONAL_URL.HOME_MANAGEMENT.NAME,
      target: PERSONAL_URL.HOME_MANAGEMENT.URL,
      type: OPEN_TYPE.BROWSER,
    },
  ],
  ...FOR_LATER_LINKS.map(link => ({ ...link, subgroup: 'For Later' })),
  ...LEISURE_LINKS.map(link => ({ ...link, subgroup: 'Leisure' })),
  ...LEARN_LINKS.map(link => ({ ...link, subgroup: 'Learn' })),
  ...CAREER_LINKS.map(link => ({ ...link, subgroup: 'Career' })),
];

const WORK_LINKS = [
  {
    label: MAC_OS_APP.SLACK.NAME,
    target: MAC_OS_APP.SLACK.NAME,
    type: OPEN_TYPE.MAC_APPLICATION,
  },
];

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
          {appMode === APP_MODE.PERSONAL ? (
            <GoogleTasksComponent />
          ) : (
            <GoogleTasksComponent taskListId="cXJUTkpUQzZ6bTBpQjNybA" />
          )}
          <GoogleTasksComponent taskListId="cDQ5WEpUb0s1RjkySjEyMQ" />
          <TaskListDebugComponent />
        </div>
      </>
      <div className="flex flex-col gap-4">
        <ClockComponent />
        <WeatherComponent />
      </div>
      <div className="flex flex-col gap-4">
        <LinkGroupComponent title="Quick Links" links={QUICK_LINKS} />
        {appMode === APP_MODE.PERSONAL && (
          <>
            <LinkGroupComponent title="Personal" links={PERSONAL_LINKS} />
            <DjDownloadComponent />
          </>
        )}
        {appMode === APP_MODE.WORK && (
          <LinkGroupComponent title="Work" links={WORK_LINKS} />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <CookingCalculatorCard />
        {appMode === APP_MODE.PERSONAL && <RecipeScraperComponent />}
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
    </div>
  );
}
