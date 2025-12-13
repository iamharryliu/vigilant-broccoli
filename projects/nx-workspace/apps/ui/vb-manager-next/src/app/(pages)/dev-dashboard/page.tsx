'use client';

import { FlyIoAppsComponent } from '../../components/flyio-apps.component';
import { GcloudAuthStatusComponent } from '../../components/gcloud-auth-status.component';
import { GithubRepoActionStatusBadges } from '../../components/github-actions-status.component';
import { GithubTeamManager } from '../../components/github-manager.component';
import { LinkGroupComponent } from '../../components/link-group.component';
import { PublicIpComponent } from '../../components/public-ip.component';
import { WireguardStatusComponent } from '../../components/wireguard-status.component';
import { LINK_TYPE } from '../page';

const DEV_LINKS = [
  {
    label: 'GCP',
    target: 'https://console.cloud.google.com',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Cron Guru',
    target: 'https://crontab.guru/',
    type: LINK_TYPE.BROWSER,
  },
  { label: 'GitHub', target: 'https://github.com', type: LINK_TYPE.BROWSER },
  {
    label: 'GitHub Tokens',
    target: 'https://github.com/settings/personal-access-tokens',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'MongoDB Console',
    target: 'https://cloud.mongodb.com/v2/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'Google Analytics',
    target: 'https://analytics.google.com/analytics/',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'reCAPTCHA Admin',
    target: 'https://www.google.com/recaptcha/admin/',
    type: LINK_TYPE.BROWSER,
  },
];

const VB_LINKS = [
  {
    label: 'NPM Packages',
    target: 'https://www.npmjs.com/settings/vigilant-broccoli/packages',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'GitHub Repo',
    target: 'https://github.com/iamharryliu/vigilant-broccoli',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'GitHub Actions',
    target: 'https://github.com/iamharryliu/vigilant-broccoli/actions',
    type: LINK_TYPE.BROWSER,
  },
  {
    label: 'GCP API Credentials',
    target:
      'https://console.cloud.google.com/apis/credentials?project=vigilant-broccoli',
    type: LINK_TYPE.BROWSER,
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
        <GithubTeamManager />
      </div>
      <div className="flex flex-col gap-4">
        <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
        <FlyIoAppsComponent />
      </div>
      <div className="flex flex-col gap-4">
        <LinkGroupComponent
          title="Links"
          links={LINKS}
          alphabeticalSubgroups={false}
        />
      </div>
      <div className="flex flex-col gap-4">
        <PublicIpComponent />
        <GcloudAuthStatusComponent />
        <WireguardStatusComponent />
      </div>
    </div>
  );
}
