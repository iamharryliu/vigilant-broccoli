'use client';

import { Box, Callout, Flex, Text } from '@radix-ui/themes';
import {
  Button,
  ButtonConfig,
  ButtonList,
  StatusCardList,
  StatusCardListItem,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';
import { CardSkeleton } from './skeleton.component';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight, Users } from 'lucide-react';
import { CardContainer } from './card-container.component';
import { GithubOrgBasic } from '@vigilant-broccoli/common-js';
import { GITHUB_LINK } from '@vigilant-broccoli/links';

const TITLE = 'Github Organizations';
const GITHUB_BASE = 'https://github.com';
const ORGANIZATIONS_SETTINGS_LINK = {
  href: GITHUB_LINK.ORGANIZATIONS_SETTINGS.URL,
  label: 'Settings',
};

export const API_ROUTES = {
  ORGANIZATION_STRUCTURE: '/api/github/organization-structure',
  USER_ORGANIZATIONS: '/api/github/user/organizations',
};

const getOrgUrls = (orgName: string) => ({
  Home: `${GITHUB_BASE}/${orgName}`,
  Members: `${GITHUB_BASE}/orgs/${orgName}/people`,
  Teams: `${GITHUB_BASE}/orgs/${orgName}/teams`,
  Repositories: `${GITHUB_BASE}/orgs/${orgName}/repositories`,
  Settings: `${GITHUB_BASE}/organizations/${orgName}/settings/profile`,
  Billing: `${GITHUB_BASE}/organizations/${orgName}/settings/billing`,
});

const ErrorState = ({ error }: { error: string }) => (
  <Callout.Root color="red" mb="3">
    <Callout.Icon>
      <AlertCircle size={16} />
    </Callout.Icon>
    <Callout.Text>{error}</Callout.Text>
  </Callout.Root>
);

const EmptyState = () => (
  <Box style={{ textAlign: 'center', padding: '2rem' }}>
    <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
    <Text size="3" color="gray">
      No organizations found
    </Text>
  </Box>
);

const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<GithubOrgBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch(API_ROUTES.USER_ORGANIZATIONS);
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
    };
    fetchOrganizations();
  }, []);

  return { organizations, loading, error };
};

const orgLabel = (organization: GithubOrgBasic) => (
  <Flex align="center" gap="2">
    <img
      src={organization.avatar_url}
      alt={organization.login}
      style={{ width: '20px', height: '20px', borderRadius: '4px' }}
    />
    <Text size="2" weight="bold">
      {organization.login}
    </Text>
  </Flex>
);

const toItem = (
  organization: GithubOrgBasic,
  onOrgClick: (orgLogin: string) => void,
): StatusCardListItem => ({
  id: organization.login,
  label: '',
  badges: orgLabel(organization),
  actions: (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => onOrgClick(organization.login)}
    >
      See more
      <ChevronRight size={14} />
    </Button>
  ),
  children: (
    <ButtonList
      buttons={Object.entries(getOrgUrls(organization.login)).map(
        ([label, url]): ButtonConfig => ({
          label,
          onClick: () => window.open(url, '_blank', WINDOW_OPEN_FEATURES),
          isExternal: true,
        }),
      )}
    />
  ),
});

export const GithubTeamManager = () => {
  const router = useRouter();
  const { organizations, loading, error } = useOrganizations();

  const handleOrgClick = (orgLogin: string) => {
    router.push(`github-manager/organization/${orgLogin}`);
  };

  if (loading) return <CardSkeleton title={TITLE} rows={5} />;

  if (error) {
    return (
      <CardContainer
        title={TITLE}
        gap="3"
        headerLink={ORGANIZATIONS_SETTINGS_LINK}
      >
        <ErrorState error={error} />
      </CardContainer>
    );
  }

  if (organizations.length === 0) {
    return (
      <CardContainer
        title={TITLE}
        gap="3"
        headerLink={ORGANIZATIONS_SETTINGS_LINK}
      >
        <EmptyState />
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title={TITLE}
      gap="3"
      headerLink={ORGANIZATIONS_SETTINGS_LINK}
    >
      <StatusCardList
        items={organizations.map(org => toItem(org, handleOrgClick))}
        emptyMessage="No organizations found"
      />
    </CardContainer>
  );
};
