'use client';

import { WeatherComponent } from '../components/weather.component';
import { GoogleTasksComponent } from '../components/google-tasks.component';
import { TaskListDebugComponent } from '../components/task-list-debug.component';
import { DjDownloadComponent } from '../components/dj-download.component';
import { LinkGroupComponent } from '../components/link-group.component';
import { RecipeScraperComponent } from '../components/recipe-scraper.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import CookingCalculatorCard from '../../components/CookingCalculatorCard';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';

const UTILITY_LINKS = [
  {
    label: 'Google Photos',
    target: 'https://photos.google.com/?pli=1',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Google Contacts',
    target: 'https://contacts.google.com/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Google Drive',
    target: 'https://drive.google.com/drive/u/0/my-drive',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Google Maps',
    target: 'https://www.google.com/maps',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Google Translate',
    target: 'https://translate.google.com/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'ChatGPT',
    target: 'https://chat.openai.com',
    type: OPEN_TYPE.BROWSER,
  },
  { label: 'Claude', target: 'https://claude.ai', type: OPEN_TYPE.BROWSER },
  {
    label: 'Find My',
    target: 'https://www.icloud.com/find/',
    type: OPEN_TYPE.BROWSER,
  },
];

const QUICK_LINKS = [
  {
    label: 'Gmail',
    target: 'https://mail.google.com',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Google Calendar',
    target: 'https://calendar.google.com/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Google Meet',
    target: 'https://meet.google.com/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Amazon',
    target: 'https://www.amazon.com',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'YouTube',
    target: 'https://www.youtube.com',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Pinterest',
    target: 'https://www.pinterest.com',
    type: OPEN_TYPE.BROWSER,
  },

  ...UTILITY_LINKS.map(link => ({ ...link, subgroup: 'Utility' })),
];

const CAREER_LINKS = [
  {
    label: 'Resume',
    target:
      'https://docs.google.com/document/d/1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU/edit#heading=h.uzt44hq0695d',
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
    label: 'Spotify',
    target: 'Spotify',
    type: OPEN_TYPE.MAC_APPLICATION,
  },
  {
    label: 'Manga',
    target: ' https://ww2.mangafreak.me/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'To Draw',
    target: 'https://ca.pinterest.com/prettydamntired/to-draw/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'To Read',
    target:
      'https://www.goodreads.com/review/list/74043883-harry?ref=nav_mybooks&shelf=to-read',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'To Watch(Anime)',
    target: 'https://myanimelist.net/animelist/prettydamntired?status=6',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'To Watch(Movies/Shows)',
    target: 'https://www.imdb.com/user/ur45097057/watchlist',
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
    target:
      '~/Library/Mobile Documents/iCloud~md~obsidian/Documents/journal/productivity/TODO.md',
    type: OPEN_TYPE.VSCODE,
  },
  {
    label: 'TODO(vigilant-broccoli)',
    target: '~/vigilant-broccoli/TODO.md',
    type: OPEN_TYPE.VSCODE,
  },
  {
    label: 'YouTube Watch Later',
    target: 'https://www.youtube.com/playlist?list=WL',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Instagram Saved',
    target: 'https://www.instagram.com/prettydamntired/saved/all-posts/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Reddit Saved',
    target: 'https://www.reddit.com/user/itzliu/saved/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Expiration',
    target: '~/journal/management/expiration.md',
    type: OPEN_TYPE.VSCODE,
  },
];

const PERSONAL_LINKS = [
  ...[
    {
      label: 'Food',
      target:
        '~/Library/Mobile Documents/iCloud~md~obsidian/Documents/journal/Food.md',
      type: OPEN_TYPE.VSCODE,
    },
    {
      label: 'Groceries',
      target:
        'https://outlook.live.com/host/0/0d5c91ee-5be2-4b79-81ed-23e6c4580427/ToDoId',
      type: OPEN_TYPE.BROWSER,
    },
    {
      label: 'Home Management',
      target:
        'https://docs.google.com/document/d/1-kKUgs80h0BLM_KijHhSXp68i3omaAeg-54LTF47PA8/edit?usp=sharing',
      type: OPEN_TYPE.BROWSER,
    },
  ],
  ...FOR_LATER_LINKS.map(link => ({ ...link, subgroup: 'For Later' })),
  ...LEISURE_LINKS.map(link => ({ ...link, subgroup: 'Leisure' })),
  ...LEARN_LINKS.map(link => ({ ...link, subgroup: 'Learn' })),
  ...CAREER_LINKS.map(link => ({ ...link, subgroup: 'Career' })),
];

const WORK_LINKS = [
  { label: 'Slack', target: 'Slack', type: OPEN_TYPE.MAC_APPLICATION },
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
      { email: GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL, color: GOOGLE_CALENDAR.CALENDAR_COLOR.GREEN },
      { email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK, color: GOOGLE_CALENDAR.CALENDAR_COLOR.RED },
    ],
    sharedCalendars: [
      { id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN, color: GOOGLE_CALENDAR.CALENDAR_COLOR.PURPLE },
      { id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.PHASES_OF_THE_MOON, color: GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_PINK },
    ],
  },
  work: {
    height: 600,
    wkst: 2,
    ctz: GOOGLE_CALENDAR.TIMEZONE.STOCKHOLM,
    showPrint: 0,
    mode: 'AGENDA',
    ownerCalendars: [
      { email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK, color: GOOGLE_CALENDAR.CALENDAR_COLOR.LIGHT_BLUE },
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
