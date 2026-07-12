'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

const TAB_PARAM = 'tab';

function DevDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get(TAB_PARAM) ?? TAB.LOCAL;

  const setActiveTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(TAB_PARAM, value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={setActiveTab}
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
            <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DevDashboardContent />
    </Suspense>
  );
}
