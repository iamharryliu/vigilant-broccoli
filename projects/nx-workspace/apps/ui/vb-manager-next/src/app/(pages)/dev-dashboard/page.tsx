'use client';

import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';
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
import { TerraformStatusComponent } from '../../components/terraform-status.component';
import { WireguardStatusComponent } from '../../components/wireguard-status.component';
import { WranglerPagesComponent } from '../../components/wrangler-pages.component';
import { VercelAppsComponent } from '../../components/vercel-apps.component';
import { LocalServicesComponent } from '../../components/local-services.component';
import { LanDevicesComponent } from '../../components/lan-devices.component';
import { OutboundConnectionsComponent } from '../../components/outbound-connections.component';
import { TextToolsPage } from '../../components/pages/TextToolsPage';
import { FeatureSandboxPage } from '../../components/pages/FeatureSandboxPage';
import { ApiKeysComponent } from '../../components/api-keys.component';
import { TodoListComponent } from '../../components/todo-list.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

const TAB = {
  LOCAL: 'local',
  CLOUD: 'cloud',
  NETWORK: 'network',
  TEXT_TOOLS: 'text-tools',
  API_KEYS: 'api-keys',
  TODO: 'todo',
  FEATURE_SANDBOX: 'feature-sandbox',
} as const;

type Tab = (typeof TAB)[keyof typeof TAB];

const TAB_STORAGE_KEY = 'dev-dashboard-tab';

const REPO_URL = 'https://github.com/iamharryliu/vigilant-broccoli';

const isTab = (value: string | null): value is Tab =>
  Object.values(TAB).includes(value as Tab);

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.DEV_DASHBOARD.title);
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
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="h-full flex flex-col"
    >
      <TabsList>
        <TabsTrigger value={TAB.LOCAL}>Local Service</TabsTrigger>
        <TabsTrigger value={TAB.CLOUD}>Cloud Services</TabsTrigger>
        <TabsTrigger value={TAB.NETWORK}>Network Tools</TabsTrigger>
        <TabsTrigger value={TAB.TEXT_TOOLS}>Text Tools</TabsTrigger>
        <TabsTrigger value={TAB.API_KEYS}>API Keys</TabsTrigger>
        <TabsTrigger value={TAB.TODO}>Todo</TabsTrigger>
        <TabsTrigger value={TAB.FEATURE_SANDBOX}>Feature Sandbox</TabsTrigger>
      </TabsList>
      <TabsContent value={TAB.LOCAL} className="pt-4 flex-1 min-h-0">
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
      </TabsContent>
      <TabsContent value={TAB.CLOUD} className="pt-4 flex-1 min-h-0">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-4">
            <GcloudAuthStatusComponent />
            <AwsManagementComponent />
            <TerraformStatusComponent />
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
      </TabsContent>
      <TabsContent value={TAB.NETWORK} className="pt-4 flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            <LanDevicesComponent />
          </div>
          <div className="flex flex-col gap-4">
            <OutboundConnectionsComponent />
          </div>
          <div className="flex flex-col gap-4">
            <LocalServicesComponent />
          </div>
        </div>
      </TabsContent>
      <TabsContent value={TAB.TEXT_TOOLS} className="pt-4 flex-1 min-h-0">
        <TextToolsPage />
      </TabsContent>
      <TabsContent value={TAB.API_KEYS} className="pt-4 flex-1 min-h-0">
        <ApiKeysComponent />
      </TabsContent>
      <TabsContent
        value={TAB.TODO}
        className="pt-4 flex-1 min-h-0 overflow-y-auto"
      >
        <TodoListComponent />
      </TabsContent>
      <TabsContent
        value={TAB.FEATURE_SANDBOX}
        className="pt-4 flex-1 min-h-0 overflow-y-auto"
      >
        <FeatureSandboxPage />
      </TabsContent>
    </Tabs>
  );
}
