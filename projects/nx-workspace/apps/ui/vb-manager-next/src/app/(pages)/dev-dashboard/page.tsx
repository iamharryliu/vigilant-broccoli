'use client';

import { FlyIoAppsComponent } from '../../components/flyio-apps.component';
import { GcloudAuthStatusComponent } from '../../components/gcloud-auth-status.component';
import { GithubRepoActionStatusBadges } from '../../components/github-actions-status.component';
import { GithubTeamManager } from '../../components/github-manager.component';
import { LinkGroupComponent } from '../../components/link-group.component';
import { PublicIpComponent } from '../../components/public-ip.component';
import { WireguardStatusComponent } from '../../components/wireguard-status.component';

const DEV_LINKS = [
  {
    label: 'GCP',
    href: 'https://console.cloud.google.com',
    type: 'browser' as const,
  },
  {
    label: 'Cron Guru',
    href: 'https://crontab.guru/',
    type: 'browser' as const,
  },
  { label: 'GitHub', href: 'https://github.com', type: 'browser' as const },
  {
    label: 'GitHub Tokens',
    href: 'https://github.com/settings/personal-access-tokens',
    type: 'browser' as const,
  },
  {
    label: 'MongoDB Console',
    href: 'https://cloud.mongodb.com/v2/',
    type: 'browser' as const,
  },
  {
    label: 'Google Analytics',
    href: 'https://analytics.google.com/analytics/',
    type: 'browser' as const,
  },
  {
    label: 'reCAPTCHA Admin',
    href: 'https://www.google.com/recaptcha/admin/',
    type: 'browser' as const,
  },
];

const VB_LINKS = [
  {
    label: 'NPM Packages',
    href: 'https://www.npmjs.com/settings/vigilant-broccoli/packages',
    type: 'browser' as const,
  },
  {
    label: 'GitHub Repo',
    href: 'https://github.com/iamharryliu/vigilant-broccoli',
    type: 'browser' as const,
  },
  {
    label: 'GitHub Actions',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions',
    type: 'browser' as const,
  },
];

export default function Page() {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      <div className="flex flex-col gap-4">
         <GithubTeamManager />
      </div>
      <div className="flex flex-col gap-4">
        <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
        <FlyIoAppsComponent />
      </div>
      <div className="flex flex-col gap-4">
        <LinkGroupComponent title="VB Links" links={VB_LINKS} />
        <LinkGroupComponent title="Dev Links" links={DEV_LINKS} />
      </div>
      <div className="flex flex-col gap-4">
        <PublicIpComponent />
        <GcloudAuthStatusComponent />
        <WireguardStatusComponent />
      </div>
    </div>
  );
}
