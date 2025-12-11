'use client';

import { WeatherComponent } from '../components/weather.component';
import { GoogleTasksComponent } from '../components/google-tasks.component';
import { TaskListDebugComponent } from '../components/task-list-debug.component';
import { DjDownloadComponent } from '../components/dj-download.component';
import { LinkGroupComponent } from '../components/link-group.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import Calculator from '../../components/Calculator';

const LINKS = [
  { label: 'Amazon', href: 'https://www.amazon.com', type: 'browser' as const },
  { label: 'Gmail', href: 'https://mail.google.com', type: 'browser' as const },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com',
    type: 'browser' as const,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com',
    type: 'browser' as const,
  },
  {
    label: 'ChatGPT',
    href: 'https://chat.openai.com',
    type: 'browser' as const,
  },
  { label: 'Claude', href: 'https://claude.ai', type: 'browser' as const },
  {
    label: 'Google Maps',
    href: 'https://www.google.com/maps',
    type: 'browser' as const,
  },
  {
    label: 'Google Translate',
    href: 'https://translate.google.com/',
    type: 'browser' as const,
  },
  {
    label: 'Google Calendar',
    href: 'https://calendar.google.com/',
    type: 'browser' as const,
  },
  {
    label: 'Google Meet',
    href: 'https://meet.google.com/',
    type: 'browser' as const,
  },
  {
    label: 'Google Drive',
    href: 'https://drive.google.com/drive/u/0/my-drive',
    type: 'browser' as const,
  },
  {
    label: 'Google Contacts',
    href: 'https://contacts.google.com/',
    type: 'browser' as const,
  },
  {
    label: 'Find My',
    href: 'https://www.icloud.com/find/',
    type: 'browser' as const,
  },
  {
    label: 'Google Photos',
    href: 'https://photos.google.com/?pli=1',
    type: 'browser' as const,
  },
  {
    label: 'Pinterest',
    href: 'https://www.pinterest.com',
    type: 'browser' as const,
  },
];

const LEISURE_LINKS = [
  {
    label: 'Manga',
    href: ' https://ww2.mangafreak.me/',
    type: 'browser' as const,
  },
  {
    label: 'Draw',
    href: 'https://ca.pinterest.com/prettydamntired/to-draw/',
    type: 'browser' as const,
  },
  {
    label: 'Read',
    href: 'https://www.goodreads.com/review/list/74043883-harry?ref=nav_mybooks&shelf=to-read',
    type: 'browser' as const,
  },
  {
    label: 'Anime',
    href: 'https://myanimelist.net/animelist/prettydamntired?status=6',
    type: 'browser' as const,
  },
  {
    label: 'Movies/Shows',
    href: 'https://www.imdb.com/user/ur45097057/watchlist',
    type: 'browser' as const,
  },
];

const WORK_LINKS = [
  { label: 'Slack', command: "open -a 'Slack'", type: 'shell' as const },
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
        <LinkGroupComponent title="Personal" links={LINKS} />
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
        <Calculator />
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {appMode === APP_MODE.PERSONAL ? (
            <iframe
              src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FCopenhagen&showPrint=0&mode=AGENDA&title=Personal%20Calendar&src=aGFycnlsaXUxOTk1QGdtYWlsLmNvbQ&src=aGFycnkubGl1QGVsdmExMS5zZQ&color=%237cb342&color=%23ad1457"
              className="w-full h-[600px]"
              style={{ minHeight: '400px' }}
            ></iframe>
          ) : (
            <iframe
              src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FStockholm&showPrint=0&mode=AGENDA&src=aGFycnkubGl1QGVsdmExMS5zZQ&src=Y182M2M5YjM0YmIyYzczNzFkZjA0YmU4ZTRlNDIyZmQ5NWJkM2E0MzkwMzc3NzFjZWE3M2I2NzRiMmUxNmE1YjBjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZW4tZ2Iuc3dlZGlzaCNob2xpZGF5QGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23039be5&color=%23d81b60&color=%230b8043"
              className="w-full h-[600px]"
              style={{ minHeight: '400px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
