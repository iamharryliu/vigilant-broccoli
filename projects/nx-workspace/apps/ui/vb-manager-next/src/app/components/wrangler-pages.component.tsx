'use client';

import { Flex, Link, Text } from '@radix-ui/themes';
import { useEffect, useState, useMemo } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { LinkList } from './link-list.component';
import { LinkListItemConfig } from './link-list-item.component';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
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

export const WranglerPagesComponent = () => {
  const [projectsData, setProjectsData] = useState<WranglerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const linkItems = useMemo<LinkListItemConfig[]>(() => {
    return projectsData.map(project => {
      const primaryDomain = project.domains[0];
      const url = primaryDomain.includes('.')
        ? `https://${primaryDomain}`
        : `https://${primaryDomain}.pages.dev`;

      return {
        text: project.name,
        url,
        badge:
          project.domains.length > 1
            ? {
                text: `${project.domains.length} domains`,
                color: 'blue' as const,
              }
            : undefined,
        details: project.domains.length > 1 ? project.domains : undefined,
      };
    });
  }, [projectsData]);

  useEffect(() => {
    const fetchWranglerPages = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.WRANGLER_PAGES);
        const data: WranglerPagesResponse = await response.json();

        if (!data.success || !data.projects) {
          throw new Error(data.error || 'Failed to fetch Wrangler pages');
        }

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

    fetchWranglerPages();
    const interval = setInterval(fetchWranglerPages, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CardSkeleton title="Wrangler Pages" rows={5} />;
  }

  if (error) {
    return (
      <CardContainer
        title="Wrangler Pages"
        gap="3"
        headerAction={
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
        }
      >
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title="Wrangler Pages"
      gap="3"
      headerAction={
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
      }
    >
      <LinkList items={linkItems} emptyMessage="No projects found" />
    </CardContainer>
  );
};
