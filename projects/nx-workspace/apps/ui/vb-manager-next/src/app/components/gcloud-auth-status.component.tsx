'use client';

import { Flex, Text, Badge } from '@radix-ui/themes';
import {
  BORDER_ACTIVE,
  Button,
  buttonVariants,
  MonospaceText,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const GCP_CONSOLE_BASE = 'https://console.cloud.google.com';

const BUTTON_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  secrets: 'Secrets',
  buckets: 'Buckets',
  gce: 'GCE',
  'cloud sql': 'Cloud SQL',
  credentials: 'Credentials',
};

const getProjectUrls = (projectId: string) => ({
  dashboard: `${GCP_CONSOLE_BASE}/home/dashboard?project=${projectId}`,
  secrets: `${GCP_CONSOLE_BASE}/security/secret-manager?project=${projectId}`,
  buckets: `${GCP_CONSOLE_BASE}/storage/browser?project=${projectId}`,
  gce: `${GCP_CONSOLE_BASE}/compute/overview?project=${projectId}`,
  'cloud sql': `${GCP_CONSOLE_BASE}/sql/instances?project=${projectId}`,
  credentials: `${GCP_CONSOLE_BASE}/apis/credentials?referrer=search&project=${projectId}`,
});

interface GcloudAccount {
  account: string;
  status: string;
}

interface GcloudProject {
  projectId: string;
  name: string;
  projectNumber: string;
}

interface GcloudAuthStatus {
  activeAccount: string | null;
  accounts: GcloudAccount[];
  currentProject: string | null;
}

interface ReauthStatus {
  needsReauth: boolean;
  activeAccount: string | null;
  error?: string;
}

interface AccountItemProps {
  account: GcloudAccount;
  isActive: boolean;
  needsAuth: boolean;
  switchingProject: string | null;
  activeAccount: string | null;
  onSwitchAccount: (account: string) => void;
}

const BORDER_NEEDS_AUTH =
  'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600';
const BORDER_INACTIVE =
  'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';

const getAccountBorderStyle = (isActive: boolean, needsAuth: boolean) => {
  if (isActive && needsAuth) return BORDER_NEEDS_AUTH;
  if (isActive) return BORDER_ACTIVE;
  return BORDER_INACTIVE;
};

const AccountBadge = ({
  isActive,
  needsAuth,
}: {
  isActive: boolean;
  needsAuth: boolean;
}) => {
  if (needsAuth)
    return (
      <Badge color="yellow" size="1">
        ⚠️ Reauth
      </Badge>
    );
  if (isActive)
    return (
      <Badge color="green" size="1">
        Active
      </Badge>
    );
  return null;
};

const AUTH_COMMAND =
  'gcloud auth login && gcloud auth application-default login';

const AccountItem = ({
  account,
  isActive,
  needsAuth,
  switchingProject,
  onSwitchAccount,
}: AccountItemProps) => (
  <Flex
    align="center"
    gap="2"
    wrap="wrap"
    className={`p-2 rounded border ${getAccountBorderStyle(isActive, needsAuth)}`}
  >
    <AccountBadge isActive={isActive} needsAuth={needsAuth} />
    <Text size="2" weight={isActive ? 'bold' : 'regular'} className="flex-1">
      {account.account}
    </Text>
    {needsAuth && <MonospaceText text={AUTH_COMMAND} truncate={true} />}
    {!isActive && (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onSwitchAccount(account.account)}
        disabled={switchingProject === account.account}
      >
        {switchingProject === account.account ? 'Switching...' : 'Select'}
      </Button>
    )}
  </Flex>
);

const toProjectItem = (
  project: GcloudProject,
  isCurrent: boolean,
  switchingProject: string | null,
  onSwitch: (projectId: string) => void,
): StatusCardListItem => ({
  id: project.projectId,
  label: project.name || project.projectId,
  borderClassName: isCurrent ? BORDER_ACTIVE : undefined,
  badges: isCurrent ? (
    <Badge color="green" size="1">
      Current
    </Badge>
  ) : undefined,
  actions: !isCurrent ? (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => onSwitch(project.projectId)}
      disabled={switchingProject === project.projectId}
    >
      {switchingProject === project.projectId ? 'Switching...' : 'Select'}
    </Button>
  ) : undefined,
  children: (
    <Flex gap="2" wrap="wrap">
      {Object.entries(getProjectUrls(project.projectId)).map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
        >
          {BUTTON_LABELS[key]}
          <ExternalLinkIcon width="12" height="12" />
        </a>
      ))}
    </Flex>
  ),
});

const parseReauthData = (
  reauthResponse: Response,
  reauthJson: ReauthStatus | null,
  activeAccount: string | null,
): ReauthStatus =>
  reauthResponse.ok && reauthJson
    ? reauthJson
    : { needsReauth: false, activeAccount };

const fetchProjectsIfNeeded = async (needsReauth: boolean) => {
  if (needsReauth) return [];
  const projectsResponse = await fetch(API_ENDPOINTS.GCLOUD_PROJECTS);
  return projectsResponse.ok ? projectsResponse.json() : [];
};

export const GcloudAuthStatusComponent = () => {
  const [authStatus, setAuthStatus] = useState<GcloudAuthStatus | null>(null);
  const [projects, setProjects] = useState<GcloudProject[]>([]);
  const [switchingProject, setSwitchingProject] = useState<string | null>(null);
  const [reauthStatus, setReauthStatus] = useState<ReauthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const switchProject = async (projectId: string) => {
    setSwitchingProject(projectId);
    try {
      const response = await fetch(API_ENDPOINTS.GCLOUD_SET_PROJECT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch project');
      }

      const authResponse = await fetch(API_ENDPOINTS.GCLOUD_AUTH_STATUS);
      if (authResponse.ok) {
        setAuthStatus(await authResponse.json());
      }
    } catch (err) {
      // Error switching project
    } finally {
      setSwitchingProject(null);
    }
  };

  const switchAccount = async (account: string) => {
    setSwitchingProject(account);
    try {
      const response = await fetch(API_ENDPOINTS.GCLOUD_SET_ACCOUNT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch account');
      }

      const [authResponse, reauthResponse] = await Promise.all([
        fetch(API_ENDPOINTS.GCLOUD_AUTH_STATUS),
        fetch('/api/gcloud/reauth-needed'),
      ]);

      if (authResponse.ok) {
        const authData = await authResponse.json();
        setAuthStatus(authData);
        const reauthJson = reauthResponse.ok
          ? await reauthResponse.json()
          : null;
        const reauthData = parseReauthData(
          reauthResponse,
          reauthJson,
          authData.activeAccount,
        );
        setReauthStatus(reauthData);
        setProjects(await fetchProjectsIfNeeded(reauthData.needsReauth));
      }
    } catch (err) {
      // Error switching account
    } finally {
      setSwitchingProject(null);
    }
  };

  useEffect(() => {
    const fetchGcloudData = async () => {
      try {
        const [authResponse, reauthResponse] = await Promise.all([
          fetch(API_ENDPOINTS.GCLOUD_AUTH_STATUS),
          fetch('/api/gcloud/reauth-needed'),
        ]);

        if (!authResponse.ok) {
          throw new Error('Failed to fetch gcloud auth status');
        }

        const authData = await authResponse.json();
        setAuthStatus(authData);
        const reauthJson = reauthResponse.ok
          ? await reauthResponse.json()
          : null;
        const reauthData = parseReauthData(
          reauthResponse,
          reauthJson,
          authData.activeAccount,
        );
        setReauthStatus(reauthData);
        setProjects(await fetchProjectsIfNeeded(reauthData.needsReauth));
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch gcloud status',
        );
        setLoading(false);
      }
    };

    fetchGcloudData();
    const interval = setInterval(fetchGcloudData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CardSkeleton title="GCP Management" rows={3} />;
  }

  if (error) {
    return (
      <CardContainer title="GCP Management">
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  const sortedAccounts = [...(authStatus?.accounts || [])].sort((a, b) => {
    if (a.account === authStatus?.activeAccount) return -1;
    if (b.account === authStatus?.activeAccount) return 1;
    return 0;
  });

  const sortedProjects = [...projects].sort((a, b) => {
    if (a.projectId === authStatus?.currentProject) return -1;
    if (b.projectId === authStatus?.currentProject) return 1;
    return 0;
  });

  return (
    <CardContainer title="GCP Management">
      {authStatus?.activeAccount ? (
        <Flex direction="column" gap="3">
          {sortedAccounts.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="1" weight="bold">
                Accounts ({sortedAccounts.length}):
              </Text>
              <Flex direction="column" gap="1">
                {sortedAccounts.map((acc, idx) => (
                  <AccountItem
                    key={idx}
                    account={acc}
                    isActive={acc.account === authStatus.activeAccount}
                    needsAuth={
                      acc.account === authStatus.activeAccount &&
                      !!reauthStatus?.needsReauth
                    }
                    switchingProject={switchingProject}
                    activeAccount={authStatus.activeAccount}
                    onSwitchAccount={switchAccount}
                  />
                ))}
              </Flex>
            </Flex>
          )}

          {sortedProjects.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="1" weight="bold">
                All Projects ({sortedProjects.length}):
              </Text>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <StatusCardList
                  items={sortedProjects.map(project =>
                    toProjectItem(
                      project,
                      project.projectId === authStatus.currentProject,
                      switchingProject,
                      switchProject,
                    ),
                  )}
                />
              </div>
            </Flex>
          )}
        </Flex>
      ) : (
        <Flex align="center" gap="2">
          <Badge color="red" size="2">
            Not Authenticated
          </Badge>
          <Text size="2" className="text-gray-500">
            No active gcloud account
          </Text>
        </Flex>
      )}
    </CardContainer>
  );
};
