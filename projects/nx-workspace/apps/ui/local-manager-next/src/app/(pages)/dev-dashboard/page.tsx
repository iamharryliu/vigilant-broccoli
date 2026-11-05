'use client';

import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';
import { GithubRepoActionStatusBadges } from '../../components/github-actions-status.component';
import { GithubTeamManager } from '../../components/github-manager.component';
import { FeatureSandboxPage } from '../../components/pages/FeatureSandboxPage';
import { ApiKeysComponent } from '../../components/api-keys.component';
import { TodoListComponent } from '../../components/todo-list.component';
import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

const TAB = {
  LOCAL: 'local',
  CLOUD: 'cloud',
  TEAM_MANAGEMENT: 'team-management',
  CI_MANAGEMENT: 'ci-management',
  TEXT_TOOLS: 'text-tools',
  API_KEYS: 'api-keys',
  TODO: 'todo',
  FEATURE_SANDBOX: 'feature-sandbox',
} as const;

type Tab = (typeof TAB)[keyof typeof TAB];

const TAB_STORAGE_KEY = 'dev-dashboard-tab';

// Served by local-services-next through the rewrite in next.config.js.
const LOCAL_SERVICES_PATH = '/dev-dashboard/local';

// Served by cloud-services-next through the rewrite in next.config.js.
const CLOUD_SERVICES_PATH = '/dev-dashboard/cloud';

// Static Pages app; its _headers frame-ancestors allows only the manager origin.
const TEXT_TOOLS_URL = VB_APP_URL.TEXT_TOOLS.URL;

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
        <TabsTrigger value={TAB.LOCAL}>Local</TabsTrigger>
        <TabsTrigger value={TAB.CLOUD}>Cloud Services</TabsTrigger>
        <TabsTrigger value={TAB.TEAM_MANAGEMENT}>Team Management</TabsTrigger>
        <TabsTrigger value={TAB.CI_MANAGEMENT}>CI Management</TabsTrigger>
        <TabsTrigger value={TAB.TEXT_TOOLS}>Text Tools</TabsTrigger>
        <TabsTrigger value={TAB.API_KEYS}>API Keys</TabsTrigger>
        <TabsTrigger value={TAB.TODO}>Todo</TabsTrigger>
        <TabsTrigger value={TAB.FEATURE_SANDBOX}>Feature Sandbox</TabsTrigger>
      </TabsList>
      <TabsContent value={TAB.LOCAL} className="pt-4 flex-1 min-h-0">
        <iframe
          src={LOCAL_SERVICES_PATH}
          title="Local"
          className="block h-full min-h-[40rem] w-full border-0"
        />
      </TabsContent>
      <TabsContent value={TAB.CLOUD} className="pt-4 flex-1 min-h-0">
        <iframe
          src={CLOUD_SERVICES_PATH}
          title="Cloud Services"
          className="block h-full min-h-[40rem] w-full border-0"
        />
      </TabsContent>
      <TabsContent value={TAB.TEAM_MANAGEMENT} className="pt-4 flex-1 min-h-0">
        <div className="grid grid-cols-3 gap-4">
          <GithubTeamManager />
        </div>
      </TabsContent>
      <TabsContent value={TAB.CI_MANAGEMENT} className="pt-4 flex-1 min-h-0">
        <div className="grid grid-cols-3 gap-4">
          <GithubRepoActionStatusBadges repoUrl={REPO_URL} />
        </div>
      </TabsContent>
      <TabsContent value={TAB.TEXT_TOOLS} className="pt-4 flex-1 min-h-0">
        <iframe
          src={TEXT_TOOLS_URL}
          title="Text Tools"
          className="block h-full min-h-[40rem] w-full border-0"
        />
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
