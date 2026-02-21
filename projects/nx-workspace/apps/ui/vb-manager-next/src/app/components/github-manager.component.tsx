'use client';

import { Box, Text, Callout, Button, Flex } from '@radix-ui/themes';
import { Skeleton } from './skeleton.component';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ChevronRight,
  Users,
  ExternalLink,
  List,
  Rows3,
} from 'lucide-react';
import { CardContainer } from './card-container.component';
import { GithubOrgBasic } from '@vigilant-broccoli/common-js';

const ANIMATION_STYLES = `
  .org-item-container {
    transition: gap 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s ease;
  }

  .quick-links {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    margin: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  .quick-links.expanded {
    max-height: 500px;
    opacity: 1;
    pointer-events: auto;
  }
`;

if (
  typeof document !== 'undefined' &&
  !document.getElementById('github-manager-styles')
) {
  const style = document.createElement('style');
  style.id = 'github-manager-styles';
  style.textContent = ANIMATION_STYLES;
  document.head.appendChild(style);
}

const GITHUB_BASE = 'https://github.com';

const BUTTON_LABELS: Record<string, string> = {
  home: 'Home',
  members: 'Members',
  teams: 'Teams',
  repositories: 'Repositories',
  settings: 'Settings',
  billing: 'Billing',
};

const getOrgUrls = (orgName: string) => ({
  home: `${GITHUB_BASE}/${orgName}`,
  members: `${GITHUB_BASE}/orgs/${orgName}/people`,
  teams: `${GITHUB_BASE}/orgs/${orgName}/teams`,
  repositories: `${GITHUB_BASE}/orgs/${orgName}/repositories`,
  settings: `${GITHUB_BASE}/organizations/${orgName}/settings/profile`,
  billing: `${GITHUB_BASE}/organizations/${orgName}/settings/billing`,
});

export const API_ROUTES = {
  ORGANIZATION_STRUCTURE: '/api/github/organization-structure',
  USER_ORGANIZATIONS: '/api/github/user/organizations',
};

export const GithubTeamManager = () => {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<GithubOrgBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedView, setDetailedView] = useState(false);

  useEffect(() => {
    const savedView = localStorage.getItem('github-org-view-detailed');
    if (savedView !== null) {
      setDetailedView(JSON.parse(savedView));
    }
  }, []);

  const handleViewToggle = (isDetailed: boolean) => {
    setDetailedView(isDetailed);
    localStorage.setItem(
      'github-org-view-detailed',
      JSON.stringify(isDetailed),
    );
  };

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_ROUTES.USER_ORGANIZATIONS}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch organizations: ${res.statusText}`);
        }

        const userOrganizations = await res.json();
        setOrganizations(userOrganizations);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch organizations',
        );
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return (
    <CardContainer
      title={`Github Organizations${
        organizations.length ? ` (${organizations.length})` : ''
      }`}
      headerAction={
        <Flex gap="1">
          <Button
            variant={detailedView ? 'soft' : 'solid'}
            size="2"
            onClick={() => handleViewToggle(false)}
            style={{ opacity: detailedView ? 0.6 : 1 }}
          >
            <List size={16} />
          </Button>
          <Button
            variant={detailedView ? 'solid' : 'soft'}
            size="2"
            onClick={() => handleViewToggle(true)}
            style={{ opacity: detailedView ? 1 : 0.6 }}
          >
            <Rows3 size={16} />
          </Button>
        </Flex>
      }
    >
      {/* Error State */}
      {error && (
        <Callout.Root color="red" mb="3">
          <Callout.Icon>
            <AlertCircle size={16} />
          </Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* Loading State */}
      {loading && (
        <Box>
          {[1, 2, 3].map(i => (
            <Box key={i} mb="1" style={{ padding: '0.5rem 0' }}>
              <Skeleton className="h-6 w-full" />
            </Box>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && organizations.length === 0 && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray">
            No organizations found
          </Text>
        </Box>
      )}

      {/* Organizations List */}
      {!loading && !error && organizations.length > 0 && (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: detailedView ? '1rem' : '0.25rem',
          }}
        >
          {organizations.map(organization => (
            <Box
              key={organization.login}
              style={{
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: detailedView ? '0.75rem' : '0',
              }}
              className="org-item-container hover:bg-[var(--gray-3)]"
            >
              <Box
                onClick={() =>
                  router.push(
                    `github-manager/organization/${organization.login}`,
                  )
                }
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <img
                    src={organization.avatar_url}
                    alt={organization.login}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                    }}
                  />
                  <Text size="3">{organization.login}</Text>
                </Box>
                <ChevronRight size={16} style={{ opacity: 0.3 }} />
              </Box>
              <Flex
                gap="2"
                wrap="wrap"
                className={`quick-links ${detailedView ? 'expanded' : ''}`}
              >
                {Object.entries(getOrgUrls(organization.login)).map(
                  ([key, url]) => (
                    <Button
                      key={key}
                      asChild
                      variant="soft"
                      size="1"
                      onClick={e => e.stopPropagation()}
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {BUTTON_LABELS[key]}
                        <ExternalLink size={12} />
                      </a>
                    </Button>
                  ),
                )}
              </Flex>
            </Box>
          ))}
        </Box>
      )}
    </CardContainer>
  );
};
