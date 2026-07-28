'use client';

import { useEffect, useState } from 'react';
import { Tabs } from '@radix-ui/themes';
import { AwsManagementComponent } from '../../components/aws-management.component';
import { DockerStatusComponent } from '../../components/docker-status.component';
import { FlyIoAppsComponent } from '../../components/flyio-apps.component';
import { GcloudAuthStatusComponent } from '../../components/gcloud-auth-status.component';
import { GithubRepoActionStatusBadges } from '../../components/github-actions-status.component';
import { GithubTeamManager } from '../../components/github-manager.component';
import { GithubPagesComponent } from '../../components/github-pages.component';
import { PM2StatusComponent } from '../../components/pm2-status.component';
import { PublicIpComponent } from '../../components/public-ip.component';
import { TailscaleMachinesComponent } from '../../components/tailscale-machines.component';
import { WireguardStatusComponent } from '../../components/wireguard-status.component';
import { WranglerPagesComponent } from '../../components/wrangler-pages.component';
import { VercelAppsComponent } from '../../components/vercel-apps.component';
import { LocalServicesComponent } from '../../components/local-services.component';

const TAB = {
  LOCAL: 'local',
  CLOUD: 'cloud',
} as const;

type Tab = (typeof TAB)[keyof typeof TAB];

const TAB_STORAGE_KEY = 'dev-dashboard-tab';

const REPO_URL = 'https://github.com/iamharryliu/vigilant-broccoli';

const isTab = (value: string | null): value is Tab =>
  Object.values(TAB).includes(value as Tab);

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>(TAB.LOCAL);

  useEffect(() => {
    const storedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (isTab(storedTab)) setActiveTab(storedTab);
  }, []);

  const handleTabChange = (value: string) => {
    if (!isTab(value)) return;
    setActiveTab(value);
    localStorage.setItem(TAB_STORAGE_KEY, value);
  };

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={handleTabChange}
      className="h-full flex flex-col"
    >
      <Tabs.List>
        <Tabs.Trigger value={TAB.LOCAL}>Local</Tabs.Trigger>
        <Tabs.Trigger value={TAB.CLOUD}>Cloud</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={TAB.LOCAL} className="pt-4 flex-1 min-h-0">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-4">
            <PublicIpComponent />
          </div>
          <div className="flex flex-col gap-4">
            <WireguardStatusComponent />
            <TailscaleMachinesComponent />
          </div>
          <div className="flex flex-col gap-4">
            <LocalServicesComponent />
          </div>
          <div className="flex flex-col gap-4">
            <DockerStatusComponent />
            <PM2StatusComponent />
          </div>
        </div>
      </Tabs.Content>
      <Tabs.Content value={TAB.CLOUD} className="pt-4 flex-1 min-h-0">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-4">
            <GcloudAuthStatusComponent />
            <AwsManagementComponent />
          </div>
          <div className="flex flex-col gap-4">
            <FlyIoAppsComponent />
          </div>
          <div className="flex flex-col gap-4">
            <VercelAppsComponent />
            <WranglerPagesComponent />
            <GithubPagesComponent />
          </div>
          <div className="flex flex-col gap-4">
            <GithubTeamManager />
            <GithubRepoActionStatusBadges repoUrl={REPO_URL} />
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
