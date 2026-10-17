import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import {
  Badge,
  Button,
  ButtonList,
  StatusCardListItem,
  Text,
} from '@vigilant-broccoli/react-lib';
import { EllipsisCTA } from '@vigilant-broccoli/react-lib-higher-level';
import { CLOUDFLARE_LINK } from '@vigilant-broccoli/links';
import { useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../libs/auth';
import { StatusListCard } from './status-list-card.component';
import { usePolledResource } from '../hooks/usePolledResource';

const CF_ACCOUNT_ID = '26d066ec62c4d27b8da5e9aebac17293';
const CF_DASH = `https://dash.cloudflare.com/${CF_ACCOUNT_ID}`;
const PAGES_DEV_SUFFIX = '.pages.dev';
const TITLE = 'Wrangler Pages';
const DELETE_POLL_INTERVAL_MS = 3000;
const WRANGLER_POLL_INTERVAL_MS = 60000;

const DELETION_STATUS = {
  DELETING: 'deleting',
  DONE: 'done',
  ERROR: 'error',
} as const;

interface WranglerProject {
  name: string;
  domains: string[];
}

interface WranglerPagesResponse {
  success: boolean;
  projects?: WranglerProject[];
  error?: string;
}

interface DeletionStatusResponse {
  success: boolean;
  status?: (typeof DELETION_STATUS)[keyof typeof DELETION_STATUS];
  error?: string;
}

const pollDeletionStatus = (projectName: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const poll = setInterval(async () => {
      const response = await authFetch(
        `${API_ENDPOINTS.WRANGLER_PAGES}?status=${encodeURIComponent(projectName)}`,
      );
      const data: DeletionStatusResponse = await response.json();

      if (!data.success || data.status === DELETION_STATUS.ERROR) {
        clearInterval(poll);
        reject(new Error(data.error || 'Failed to delete project'));
        return;
      }
      if (data.status === DELETION_STATUS.DONE) {
        clearInterval(poll);
        resolve();
      }
    }, DELETE_POLL_INTERVAL_MS);
  });

const DASHBOARD_LINK = {
  href: CLOUDFLARE_LINK.DASHBOARD.URL,
  label: 'Dashboard',
};

export const WranglerPagesComponent = () => {
  const {
    data: projectsData,
    loading,
    error,
    refetch: fetchWranglerPages,
  } = usePolledResource<WranglerProject[]>({
    endpoint: API_ENDPOINTS.WRANGLER_PAGES,
    intervalMs: WRANGLER_POLL_INTERVAL_MS,
    errorMessage: 'Failed to fetch Wrangler pages',
    select: (json: WranglerPagesResponse) => {
      if (!json.success || !json.projects)
        throw new Error(json.error || 'Failed to fetch Wrangler pages');
      return json.projects;
    },
  });
  const [loggingIn, setLoggingIn] = useState(false);
  const [deletingProjects, setDeletingProjects] = useState<Set<string>>(
    new Set(),
  );

  const handleDelete = async (projectName: string) => {
    const response = await authFetch(API_ENDPOINTS.WRANGLER_PAGES, {
      method: HTTP_METHOD.DELETE,
      headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
      body: JSON.stringify({ projectName }),
    });
    if (!response.ok) return;

    setDeletingProjects(prev => new Set(prev).add(projectName));
    try {
      await pollDeletionStatus(projectName);
      await fetchWranglerPages();
    } catch (err) {
      console.error('Wrangler pages delete error:', err);
    } finally {
      setDeletingProjects(prev => {
        const next = new Set(prev);
        next.delete(projectName);
        return next;
      });
    }
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    await authFetch(API_ENDPOINTS.WRANGLER_LOGIN, { method: HTTP_METHOD.POST });
    const poll = setInterval(async () => {
      const response = await authFetch(API_ENDPOINTS.WRANGLER_PAGES);
      const data: WranglerPagesResponse = await response.json();
      if (data.success && data.projects) {
        clearInterval(poll);
        setLoggingIn(false);
        await fetchWranglerPages();
      }
    }, 3000);
  };

  const toItem = (project: WranglerProject): StatusCardListItem => {
    const primaryDomain = project.domains[0];
    const customDomain =
      project.domains.find(d => !d.endsWith(PAGES_DEV_SUFFIX)) ?? primaryDomain;

    const open = (url: string) => window.open(url, '_blank');

    const isDeleting = deletingProjects.has(project.name);

    return {
      id: project.name,
      label: project.name,
      badges: (
        <>
          {isDeleting && (
            <Badge color="orange" size="1">
              Deleting…
            </Badge>
          )}
          <Badge color="blue" size="1">
            Domains({project.domains.length})
          </Badge>
        </>
      ),
      actions: (
        <EllipsisCTA
          onDelete={() => handleDelete(project.name)}
          confirmDescription={`Delete "${project.name}"? This action cannot be undone.`}
        />
      ),
      children: (
        <div className="flex flex-col gap-2">
          <ButtonList
            buttons={[
              {
                label: 'Cloudflare',
                onClick: () => open(`${CF_DASH}/pages/view/${project.name}`),
                isExternal: true,
              },
              {
                label: 'DNS',
                onClick: () => open(`${CF_DASH}/${customDomain}/dns/records`),
                isExternal: true,
              },
              {
                label: 'SSL/TLS',
                onClick: () => open(`${CF_DASH}/${customDomain}/ssl-tls`),
                isExternal: true,
              },
              {
                label: 'Settings',
                onClick: () =>
                  open(`${CF_DASH}/pages/view/${project.name}/settings`),
                isExternal: true,
              },
            ]}
          />
          <Text size="1" color="gray" weight="bold">
            Domains
          </Text>
          <ButtonList
            buttons={project.domains.map(domain => ({
              label: domain,
              onClick: () =>
                open(domain.startsWith('http') ? domain : `https://${domain}`),
              isExternal: true,
            }))}
          />
        </div>
      ),
    };
  };

  return (
    <StatusListCard
      title={TITLE}
      gap="3"
      loading={loading}
      error={error}
      skeletonRows={5}
      headerLink={DASHBOARD_LINK}
      items={(projectsData ?? []).map(toItem)}
      emptyMessage="No projects found"
      errorContent={
        <Button onClick={handleLogin} loading={loggingIn} variant="secondary">
          Wrangler Login
        </Button>
      }
    />
  );
};
