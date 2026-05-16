'use client';

import { Badge, Flex, Link, Text } from '@radix-ui/themes';
import {
  Button,
  buttonVariants,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { ConfirmDeleteDialog } from './confirm-delete-dialog.component';
import { ExternalLinkIcon, TrashIcon } from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../constants/api-endpoints';

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
    const url = primaryDomain.includes('.')
      ? `https://${primaryDomain}`
      : `https://${primaryDomain}.pages.dev`;

    return {
      id: project.name,
      label: project.name,
      badges: (
        <Badge color="blue" size="1">
          Domains({project.domains.length})
        </Badge>
      ),
      actions: (
        <Flex gap="1" align="center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            title="Open site"
          >
            <ExternalLinkIcon />
          </a>
          <ConfirmDeleteDialog
            trigger={
              <Button size="icon" variant="destructive" title="Delete project">
                <TrashIcon />
              </Button>
            }
            title="Delete Wrangler Pages Project"
            description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
            onConfirm={() => handleDelete(project.name)}
            loading={deletingProject === project.name}
          />
        </Flex>
      ),
      children: (
        <>
          {project.domains.map(domain => (
            <Link
              key={domain}
              href={domain.startsWith('http') ? domain : `https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              size="2"
            >
              <Text size="2" color="gray">
                {domain}
              </Text>
            </Link>
          ))}
        </>
      ),
    };
  };

  if (loading) return <CardSkeleton title="Wrangler Pages" rows={5} />;

  if (error) {
    return (
      <CardContainer
        title="Wrangler Pages"
        gap="3"
        headerAction={dashboardLink}
      >
        <Button onClick={handleLogin} loading={loggingIn} variant="secondary">
          Wrangler Login
        </Button>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="Wrangler Pages" gap="3" headerAction={dashboardLink}>
      <StatusCardList
        items={projectsData.map(toItem)}
        emptyMessage="No projects found"
      />
    </CardContainer>
  );
};
