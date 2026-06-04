'use client';

import { Badge, Text } from '@radix-ui/themes';
import {
  Button,
  ButtonList,
  CardContainer,
  EllipsisCTA,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { CLOUDFLARE_LINK } from '@vigilant-broccoli/links';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
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

const DASHBOARD_LINK = {
  href: CLOUDFLARE_LINK.DASHBOARD.URL,
  label: 'Dashboard',
};

export const WranglerPagesComponent = () => {
  const [projectsData, setProjectsData] = useState<WranglerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

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
    const response = await fetch(API_ENDPOINTS.WRANGLER_PAGES, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName }),
    });
    if (response.ok)
      setProjectsData(prev => prev.filter(p => p.name !== projectName));
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

  if (loading) return <CardSkeleton title={TITLE} rows={5} />;

  if (error) {
    return (
      <CardContainer title={TITLE} gap="3" headerLink={DASHBOARD_LINK}>
        <Button onClick={handleLogin} loading={loggingIn} variant="secondary">
          Wrangler Login
        </Button>
      </CardContainer>
    );
  }

  return (
    <CardContainer title={TITLE} gap="3" headerLink={DASHBOARD_LINK}>
      <StatusCardList
        items={projectsData.map(toItem)}
        emptyMessage="No projects found"
      />
    </CardContainer>
  );
};
