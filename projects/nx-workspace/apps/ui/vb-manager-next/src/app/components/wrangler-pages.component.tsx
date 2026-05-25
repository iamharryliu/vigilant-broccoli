'use client';

import { Badge, Flex, Link, Text } from '@radix-ui/themes';
import {
  Button,
  ButtonList,
  DeleteIconButton,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { ConfirmDeleteDialog } from './confirm-delete-dialog.component';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const CF_ACCOUNT_ID = '26d066ec62c4d27b8da5e9aebac17293';
const CF_DASH = `https://dash.cloudflare.com/${CF_ACCOUNT_ID}`;
const PAGES_DEV_SUFFIX = '.pages.dev';
const TITLE = 'Wrangler Pages';

interface WranglerProject {
  name: string;
  domains: string[];
}

interface WranglerPagesResponse {
  success: boolean;
  projects?: WranglerProject[];
  error?: string;
}

const dashboardLink = (
  <Link
    href="https://dash.cloudflare.com"
    target="_blank"
    rel="noopener noreferrer"
    size="2"
  >
    <Flex align="center" gap="1">
      Dashboard
      <ExternalLinkIcon width="12" height="12" />
    </Flex>
  </Link>
);

export const WranglerPagesComponent = () => {
  const [projectsData, setProjectsData] = useState<WranglerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  const fetchWranglerPages = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.WRANGLER_PAGES);
      const data: WranglerPagesResponse = await response.json();
      if (!data.success || !data.projects)
        throw new Error(data.error || 'Failed to fetch Wrangler pages');
      setProjectsData(data.projects);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch Wrangler pages',
      );
      setLoading(false);
      console.error('Wrangler pages fetch error:', err);
    }
  };

  const handleDelete = async (projectName: string) => {
    setDeletingProject(projectName);
    try {
      const response = await fetch(API_ENDPOINTS.WRANGLER_PAGES, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName }),
      });
      if (!response.ok) throw new Error('Failed to delete project');
      setProjectsData(prev => prev.filter(p => p.name !== projectName));
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setDeletingProject(null);
    }
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    await fetch(API_ENDPOINTS.WRANGLER_LOGIN, { method: 'POST' });
    const poll = setInterval(async () => {
      const response = await fetch(API_ENDPOINTS.WRANGLER_PAGES);
      const data: WranglerPagesResponse = await response.json();
      if (data.success && data.projects) {
        clearInterval(poll);
        setProjectsData(data.projects);
        setLoggingIn(false);
        setError(null);
        setLoading(false);
      }
    }, 3000);
  };

  useEffect(() => {
    fetchWranglerPages();
    const interval = setInterval(fetchWranglerPages, 60000);
    return () => clearInterval(interval);
  }, []);

  const toItem = (project: WranglerProject): StatusCardListItem => {
    const primaryDomain = project.domains[0];
    const customDomain =
      project.domains.find(d => !d.endsWith(PAGES_DEV_SUFFIX)) ?? primaryDomain;

    const open = (url: string) => window.open(url, '_blank');

    return {
      id: project.name,
      label: project.name,
      badges: (
        <Badge color="blue" size="1">
          Domains({project.domains.length})
        </Badge>
      ),
      actions: (
        <ConfirmDeleteDialog
          trigger={<DeleteIconButton title="Delete project" />}
          title="Delete Wrangler Pages Project"
          description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(project.name)}
          loading={deletingProject === project.name}
        />
      ),
      children: (
        <Flex direction="column" gap="2">
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
        </Flex>
      ),
    };
  };

  if (loading) return <CardSkeleton title={TITLE} rows={5} />;

  if (error) {
    return (
      <CardContainer title={TITLE} gap="3" headerAction={dashboardLink}>
        <Button onClick={handleLogin} loading={loggingIn} variant="secondary">
          Wrangler Login
        </Button>
      </CardContainer>
    );
  }

  return (
    <CardContainer title={TITLE} gap="3" headerAction={dashboardLink}>
      <StatusCardList
        items={projectsData.map(toItem)}
        emptyMessage="No projects found"
      />
    </CardContainer>
  );
};
