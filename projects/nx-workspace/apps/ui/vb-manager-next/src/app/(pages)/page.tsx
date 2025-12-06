'use client';

import { WeatherComponent } from '../components/weather.component';
import { GoogleTasksComponent } from '../components/google-tasks.component';
import { GcloudAuthStatusComponent } from '../components/gcloud-auth-status.component';
import { WireguardStatusComponent } from '../components/wireguard-status.component';
import { GithubRepoActionStatusBadges } from '../components/github-actions-status.component';
import { TaskListDebugComponent } from '../components/task-list-debug.component';
import { DjDownloadComponent } from '../components/dj-download.component';
import { PublicIpComponent } from '../components/public-ip.component';
import { FlyIoAppsComponent } from '../components/flyio-apps.component';
import { LinkGroupComponent } from '../components/link-group.component';
import { useAppMode } from '../app-mode-context';

const LINKS = [
  { label: 'Amazon', href: 'https://www.amazon.com' },
  { label: 'Gmail', href: 'https://mail.google.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { label: 'YouTube', href: 'https://www.youtube.com' },
  { label: 'ChatGPT', href: 'https://chat.openai.com' },
  { label: 'Claude', href: 'https://claude.ai' },
  { label: 'Google Maps', href: 'https://www.google.com/maps' },
  { label: 'Google Translate', href: 'https://translate.google.com/' },
  { label: 'Google Calendar', href: 'https://calendar.google.com/' },
  { label: 'Google Meet', href: 'https://meet.google.com/' },
  {
    label: 'Google Drive',
    href: 'https://drive.google.com/drive/u/0/my-drive',
  },
  { label: 'Google Contacts', href: 'https://contacts.google.com/' },
  { label: 'Find My', href: 'https://www.icloud.com/find/' },
  { label: 'Google Photos', href: 'https://photos.google.com/?pli=1' },
  { label: 'Pinterest', href: 'https://www.pinterest.com' },
];

const DEV_LINKS = [
  { label: 'GCP', href: 'https://console.cloud.google.com' },
  { label: 'Cron Guru', href: 'https://crontab.guru/' },
  { label: 'GitHub', href: 'https://github.com' },
  {
    label: 'GitHub Tokens',
    href: 'https://github.com/settings/personal-access-tokens',
  },
  { label: 'MongoDB Console', href: 'https://cloud.mongodb.com/v2/' },
  {
    label: 'Google Analytics',
    href: 'https://analytics.google.com/analytics/',
  },
  { label: 'reCAPTCHA Admin', href: 'https://www.google.com/recaptcha/admin/' },
];

const VB_LINKS = [
  {
    label: 'NPM Packages',
    href: 'https://www.npmjs.com/settings/vigilant-broccoli/packages',
  },
  {
    label: 'GitHub Repo',
    href: 'https://github.com/iamharryliu/vigilant-broccoli',
  },
  {
    label: 'GitHub Actions',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions',
  },
];

export default function Page() {
  const { appMode } = useAppMode();

  return (
    <>
      <div className="grid grid-cols-4 gap-4 h-full mb-4">
        <>
          <div className="flex flex-col gap-4">
            {appMode === 'personal' ? (
              <GoogleTasksComponent />
            ) : (
              <GoogleTasksComponent taskListId="cXJUTkpUQzZ6bTBpQjNybA" />
            )}
            <TaskListDebugComponent />
          </div>
        </>
        <div className="flex flex-col gap-4">
          <WeatherComponent />
        </div>
        <div className="flex flex-col gap-4">
          <LinkGroupComponent title="Personal" links={LINKS} />
          <DjDownloadComponent />
        </div>

        <div className="flex flex-col gap-4">
          <PublicIpComponent />
          <GcloudAuthStatusComponent />
          <WireguardStatusComponent />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 h-full">
        <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
        <FlyIoAppsComponent />
        <div className="flex flex-col gap-4">
          <LinkGroupComponent title="VB Links" links={VB_LINKS} />
          <LinkGroupComponent title="Dev Links" links={DEV_LINKS} />
        </div>
        <div className="flex flex-col gap-4">
          <></>
        </div>
      </div>
    </>
  );
}
