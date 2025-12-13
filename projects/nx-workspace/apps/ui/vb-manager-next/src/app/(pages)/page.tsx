'use client';

import { WeatherComponent } from '../components/weather.component';
import { GoogleTasksComponent } from '../components/google-tasks.component';
import { TaskListDebugComponent } from '../components/task-list-debug.component';
import { DjDownloadComponent } from '../components/dj-download.component';
import { LinkGroupComponent } from '../components/link-group.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import CookingCalculatorCard from '../../components/CookingCalculatorCard';

export const LINK_TYPE = {
  BROWSER: 'browser',
  MAC_APPLICATION: 'mac_application',
} as const;

const LINKS = [
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
];

const CONTENT_LINKS = [
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
    label: 'Draw',
    target: 'https://ca.pinterest.com/prettydamntired/to-draw/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Read',
    target:
      'https://www.goodreads.com/review/list/74043883-harry?ref=nav_mybooks&shelf=to-read',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Anime',
    target: 'https://myanimelist.net/animelist/prettydamntired?status=6',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Movies/Shows',
    target: 'https://www.imdb.com/user/ur45097057/watchlist',
    type: LINK_TYPE.BROWSER,
  },
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
        <LinkGroupComponent title="Services" links={LINKS} />
        <LinkGroupComponent title="Content" links={CONTENT_LINKS} />
        <LinkGroupComponent title="Utility" links={UTILITY_LINKS} />
        {appMode === APP_MODE.PERSONAL && (
          <>
            <LinkGroupComponent title="Leisure" links={LEISURE_LINKS} />
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
