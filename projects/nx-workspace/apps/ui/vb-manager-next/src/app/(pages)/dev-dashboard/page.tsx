'use client';

import { DockerStatusComponent } from '../../components/docker-status.component';
import { FlyIoAppsComponent } from '../../components/flyio-apps.component';
import { GcloudAuthStatusComponent } from '../../components/gcloud-auth-status.component';
import { GithubRepoActionStatusBadges } from '../../components/github-actions-status.component';
import { GithubTeamManager } from '../../components/github-manager.component';
import { LinkGroupComponent } from '../../components/link-group.component';
import { PublicIpComponent } from '../../components/public-ip.component';
import { WireguardStatusComponent } from '../../components/wireguard-status.component';
import { WranglerPagesComponent } from '../../components/wrangler-pages.component';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';

const DEV_LINKS = [
  {
    label: 'GCP',
    target: 'https://console.cloud.google.com',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Cron Guru',
    target: 'https://crontab.guru/',
    type: OPEN_TYPE.BROWSER,
  },
  { label: 'GitHub', target: 'https://github.com', type: OPEN_TYPE.BROWSER },
  {
    label: 'GitHub Tokens',
    target: 'https://github.com/settings/personal-access-tokens',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'MongoDB Console',
    target: 'https://cloud.mongodb.com/v2/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'Google Analytics',
    target: 'https://analytics.google.com/analytics/',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'reCAPTCHA Admin',
    target: 'https://www.google.com/recaptcha/admin/',
    type: OPEN_TYPE.BROWSER,
  },
];

const VB_LINKS = [
  {
    label: 'NPM Packages',
    target: 'https://www.npmjs.com/settings/vigilant-broccoli/packages',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'GitHub Repo',
    target: 'https://github.com/iamharryliu/vigilant-broccoli',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'GitHub Actions',
    target: 'https://github.com/iamharryliu/vigilant-broccoli/actions',
    type: OPEN_TYPE.BROWSER,
  },
  {
    label: 'GCP API Credentials',
    target:
      'https://console.cloud.google.com/apis/credentials?project=vigilant-broccoli',
    type: OPEN_TYPE.BROWSER,
  },
];

const LINKS = [
  ...VB_LINKS.map(link => ({ ...link, subgroup: 'vigilant-broccoli' })),
  ...DEV_LINKS.map(link => ({ ...link, subgroup: 'Dev' })),
];

export default function Page() {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      <div className="flex flex-col gap-4">
        <PublicIpComponent />
        <WireguardStatusComponent />
        <DockerStatusComponent />
      </div>
      <div className="flex flex-col gap-4">
        <GcloudAuthStatusComponent />
        <FlyIoAppsComponent />
        <WranglerPagesComponent />
      </div>
      <div className="flex flex-col gap-4">
        <GithubTeamManager />
        <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
      </div>
      <div className="flex flex-col gap-4">
        <LinkGroupComponent
          title="Links"
          links={LINKS}
          alphabeticalSubgroups={false}
        />
      </div>
    </div>
  );
}
