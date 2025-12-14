'use client';

import { WeatherComponent } from '../components/weather.component';
import { GoogleTasksComponent } from '../components/google-tasks.component';
import { TaskListDebugComponent } from '../components/task-list-debug.component';
import { DjDownloadComponent } from '../components/dj-download.component';
import { LinkGroupComponent } from '../components/link-group.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import CookingCalculatorCard from '../../components/CookingCalculatorCard';
import { LINK_TYPE } from '../constants/link-types';

const QUICK_LINKS = [
  {
    label: 'Gmail',
    target: 'https://mail.google.com',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Google Calendar',
    target: 'https://calendar.google.com/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Google Meet',
    target: 'https://meet.google.com/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Amazon',
    target: 'https://www.amazon.com',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'YouTube',
    target: 'https://www.youtube.com',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Pinterest',
    target: 'https://www.pinterest.com',
    type: LINK_TYPE.BROWSER,
  },
];

const CAREER_LINKS = [
  {
    label: 'Resume',
    target:
      'https://docs.google.com/document/d/1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU/edit#heading=h.uzt44hq0695d',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'LinkedIn',
    target: 'https://www.linkedin.com',
    type: LINK_TYPE.BROWSER,
  },
];

const UTILITY_LINKS = [
  {
    label: 'Google Photos',
    target: 'https://photos.google.com/?pli=1',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Google Contacts',
    target: 'https://contacts.google.com/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Google Drive',
    target: 'https://drive.google.com/drive/u/0/my-drive',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Google Maps',
    target: 'https://www.google.com/maps',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Google Translate',
    target: 'https://translate.google.com/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'ChatGPT',
    target: 'https://chat.openai.com',
    type: LINK_TYPE.BROWSER,
  },
  { label: 'Claude', target: 'https://claude.ai', type: LINK_TYPE.BROWSER },
  {
    label: 'Find My',
    target: 'https://www.icloud.com/find/',
    type: LINK_TYPE.BROWSER,
  },
];

const LEISURE_LINKS = [
  {
    label: 'Spotify',
    target: 'Spotify',
    type: LINK_TYPE.MAC_APPLICATION,
  },
  {
    label: 'Manga',
    target: ' https://ww2.mangafreak.me/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'To Draw',
    target: 'https://ca.pinterest.com/prettydamntired/to-draw/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'To Read',
    target:
      'https://www.goodreads.com/review/list/74043883-harry?ref=nav_mybooks&shelf=to-read',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'To Watch(Anime)',
    target: 'https://myanimelist.net/animelist/prettydamntired?status=6',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'To Watch(Movies/Shows)',
    target: 'https://www.imdb.com/user/ur45097057/watchlist',
    type: LINK_TYPE.BROWSER,
  },
];

const LEARN_LINKS = [
  {
    label: 'Udemy',
    target: 'https://www.udemy.com/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Memrise',
    target: 'https://app.memrise.com/dashboard',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Memrise (Community Version)',
    target: 'https://community-courses.memrise.com/dashboard',
    type: LINK_TYPE.BROWSER,
  },
];

const PERSONAL_LINKS = [
  ...[
    {
      label: 'Food',
      target:
        '~/Library/Mobile Documents/iCloud~md~obsidian/Documents/journal/Food.md',
      type: LINK_TYPE.VSCODE,
    },
    {
      label: 'Groceries',
      target:
        'https://outlook.live.com/host/0/0d5c91ee-5be2-4b79-81ed-23e6c4580427/ToDoId',
      type: LINK_TYPE.BROWSER,
    },
    {
      label: 'Home Management',
      target:
        'https://docs.google.com/document/d/1-kKUgs80h0BLM_KijHhSXp68i3omaAeg-54LTF47PA8/edit?usp=sharing',
      type: LINK_TYPE.BROWSER,
    },
  ],
  ...LEISURE_LINKS.map(link => ({ ...link, subgroup: 'Leisure' })),
  ...LEARN_LINKS.map(link => ({ ...link, subgroup: 'Learn' })),
  ...CAREER_LINKS.map(link => ({ ...link, subgroup: 'Career' })),
];

const WORK_LINKS = [
  { label: 'Slack', target: 'Slack', type: LINK_TYPE.MAC_APPLICATION },
];

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
        <LinkGroupComponent title="Utility" links={UTILITY_LINKS} />
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
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          {appMode === APP_MODE.PERSONAL ? (
            <iframe
              src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FCopenhagen&showPrint=0&mode=AGENDA&title=Personal%20Calendar&src=aGFycnlsaXUxOTk1QGdtYWlsLmNvbQ&src=aGFycnkubGl1QGVsdmExMS5zZQ&color=%237cb342&color=%23ad1457"
              className="w-full h-[600px] dark:invert dark:hue-rotate-180"
              style={{ minHeight: '400px' }}
            ></iframe>
          ) : (
            <iframe
              src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FStockholm&showPrint=0&mode=AGENDA&src=aGFycnkubGl1QGVsdmExMS5zZQ&src=Y182M2M5YjM0YmIyYzczNzFkZjA0YmU4ZTRlNDIyZmQ5NWJkM2E0MzkwMzc3NzFjZWE3M2I2NzRiMmUxNmE1YjBjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZW4tZ2Iuc3dlZGlzaCNob2xpZGF5QGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23039be5&color=%23d81b60&color=%230b8043"
              className="w-full h-[600px] dark:invert dark:hue-rotate-180"
              style={{ minHeight: '400px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
