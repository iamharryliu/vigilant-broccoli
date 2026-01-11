'use client';

import { Box, Text, Skeleton, Callout } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight, Users } from 'lucide-react';
import { CardContainer } from './card-container.component';
import { GithubOrgBasic } from '@vigilant-broccoli/common-js';

export const API_ROUTES = {
  ORGANIZATION_STRUCTURE: '/api/github/organization-structure',
  USER_ORGANIZATIONS: '/api/github/user/organizations',
};

export const GithubTeamManager = () => {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<GithubOrgBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      title={`Github Organizations${organizations.length ? ` (${organizations.length})` : ''}`}
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
              <Skeleton height="24px" />
            </Box>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && organizations.length === 0 && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Users
            size={48}
            style={{ margin: '0 auto 1rem', opacity: 0.3 }}
          />
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
            gap: '0.25rem',
          }}
        >
          {organizations.map(organization => (
            <Box
              key={organization.login}
              onClick={() =>
                router.push(`github-manager/organization/${organization.login}`)
              }
              style={{
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.15s ease',
              }}
              className="hover:bg-[var(--gray-3)]"
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
                  style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                />
                <Text size="3">
                  {organization.login}
                </Text>
              </Box>
              <ChevronRight size={16} style={{ opacity: 0.3 }} />
            </Box>
          ))}
        </Box>
      )}
    </CardContainer>
  );
};
