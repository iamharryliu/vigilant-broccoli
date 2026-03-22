'use client';

import { Flex, Text, Badge, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { ExternalLinkIcon, CopyIcon, CheckIcon } from '@radix-ui/react-icons';
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
    className={`p-2 rounded border ${
      isActive && needsAuth
        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600'
        : isActive
        ? 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}
  >
    {isActive && !needsAuth && (
      <Badge color="green" size="1">
        Active
      </Badge>
    )}
    {needsAuth && (
      <Badge color="yellow" size="1">
        ⚠️ Reauth
      </Badge>
    )}
    <Text size="2" weight={isActive ? 'bold' : 'regular'} className="flex-1">
      {account.account}
    </Text>
    {!isActive && (
      <Button
        variant="soft"
        size="1"
        onClick={() => onSwitchAccount(account.account)}
        disabled={switchingProject === account.account}
      >
        {switchingProject === account.account ? 'Switching...' : 'Select'}
      </Button>
    )}
  </Flex>
);

export const GcloudAuthStatusComponent = () => {
  const [authStatus, setAuthStatus] = useState<GcloudAuthStatus | null>(null);
  const [projects, setProjects] = useState<GcloudProject[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [switchingProject, setSwitchingProject] = useState<string | null>(null);
  const [reauthStatus, setReauthStatus] = useState<ReauthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);

  const copyAuthCommand = () => {
    navigator.clipboard.writeText(
      'gcloud auth login && gcloud auth application-default login',
    );
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

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
        const authData = await authResponse.json();
        setAuthStatus(authData);
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

        let reauthData: ReauthStatus = {
          needsReauth: false,
          activeAccount: authData.activeAccount,
        };

        if (reauthResponse.ok) {
          reauthData = await reauthResponse.json();
        }

        setReauthStatus(reauthData);

        if (!reauthData.needsReauth) {
          const projectsResponse = await fetch(API_ENDPOINTS.GCLOUD_PROJECTS);
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData);
          }
        } else {
          setProjects([]);
        }
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

        let reauthData: ReauthStatus = {
          needsReauth: false,
          activeAccount: authData.activeAccount,
        };

        if (reauthResponse.ok) {
          reauthData = await reauthResponse.json();
        }

        setReauthStatus(reauthData);

        if (!reauthData.needsReauth) {
          const projectsResponse = await fetch(API_ENDPOINTS.GCLOUD_PROJECTS);
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData);
          }
        } else {
          setProjects([]);
        }

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

  return (
    <CardContainer title="GCP Management">
      {authStatus?.activeAccount ? (
        <Flex direction="column" gap="3">
          {authStatus.accounts.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="1" weight="bold">
                Accounts ({authStatus.accounts.length}):
              </Text>
              <Flex direction="column" gap="1">
                {authStatus.accounts
                  .sort((a, b) => {
                    if (a.account === authStatus.activeAccount) return -1;
                    if (b.account === authStatus.activeAccount) return 1;
                    return 0;
                  })
                  .map((acc, idx) => {
                    const isActive = acc.account === authStatus.activeAccount;
                    const needsAuth = isActive && reauthStatus?.needsReauth;
                    return (
                      <Flex key={idx} direction="column" gap="1">
                        <AccountItem
                          account={acc}
                          isActive={isActive}
                          needsAuth={!!needsAuth}
                          switchingProject={switchingProject}
                          activeAccount={authStatus.activeAccount}
                          onSwitchAccount={switchAccount}
                        />
                        {needsAuth && (
                          <Button
                            variant="ghost"
                            size="1"
                            onClick={copyAuthCommand}
                            title="Copy auth command"
                          >
                            {copiedCommand ? (
                              <CheckIcon width="16" height="16" />
                            ) : (
                              <CopyIcon width="16" height="16" />
                            )}
                          </Button>
                        )}
                      </Flex>
                    );
                  })}
              </Flex>
            </Flex>
          )}

          {projects.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="1" weight="bold">
                All Projects ({projects.length}):
              </Text>
              <Flex
                direction="column"
                gap="1"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                {projects
                  .sort((a, b) => {
                    if (a.projectId === authStatus.currentProject) return -1;
                    if (b.projectId === authStatus.currentProject) return 1;
                    return 0;
                  })
                  .map(project => {
                    const isExpanded = expandedProjects.has(project.projectId);
                    const isCurrent =
                      project.projectId === authStatus.currentProject;
                    return (
                      <Flex
                        key={project.projectId}
                        direction="column"
                        gap="2"
                        className={`p-2 rounded border ${
                          isCurrent
                            ? 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <Flex align="center" gap="2" wrap="wrap">
                          <Text
                            size="2"
                            className="cursor-pointer"
                            onClick={() => toggleProject(project.projectId)}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </Text>
                          {isCurrent && (
                            <Badge color="green" size="1">
                              Current
                            </Badge>
                          )}
                          <Text
                            size="2"
                            weight={isCurrent ? 'bold' : 'regular'}
                            className="flex-1 cursor-pointer"
                            onClick={() => toggleProject(project.projectId)}
                          >
                            {project.name || project.projectId}
                          </Text>
                          <Text size="1" color="gray">
                            ({project.projectId})
                          </Text>
                          {!isCurrent && (
                            <Button
                              variant="soft"
                              size="1"
                              onClick={() => switchProject(project.projectId)}
                              disabled={switchingProject === project.projectId}
                            >
                              {switchingProject === project.projectId
                                ? 'Switching...'
                                : 'Select'}
                            </Button>
                          )}
                        </Flex>

                        {isExpanded && (
                          <Flex
                            gap="2"
                            wrap="wrap"
                            className="pl-6 pt-1 border-t border-gray-200 dark:border-gray-700"
                          >
                            {Object.entries(
                              getProjectUrls(project.projectId),
                            ).map(([key, url]) => (
                              <Button key={key} asChild variant="soft" size="1">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {BUTTON_LABELS[key]}
                                  <ExternalLinkIcon width="12" height="12" />
                                </a>
                              </Button>
                            ))}
                          </Flex>
                        )}
                      </Flex>
                    );
                  })}
              </Flex>
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
