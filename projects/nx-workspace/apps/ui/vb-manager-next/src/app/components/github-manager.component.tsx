'use client';

import { Box, Text, Skeleton, Callout } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, AlertCircle } from 'lucide-react';
import { CardContainer } from './card-container.component';

export const API_ROUTES = {
  ORGANIZATION_STRUCTURE: '/api/github/organization-structure',
  USER_ORGANIZATIONS: '/api/github/user/organizations',
};

export const GithubTeamManager = () => {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<string[]>([]);
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
            <Box key={i} mb="2" style={{ padding: '1rem', backgroundColor: 'var(--gray-2)', borderRadius: '6px' }}>
              <Skeleton height="40px" />
            </Box>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && organizations.length === 0 && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Building2
            size={48}
            style={{ margin: '0 auto 1rem', opacity: 0.3 }}
          />
          <Text size="3" color="gray">
            No organizations found
          </Text>
        </Box>
      )}

      {/* Organizations List */}
      {!loading &&
        !error &&
        organizations.map(organization => {
          return (
            <Box
              key={organization}
              onClick={() =>
                router.push(`github-manager/organization/${organization}`)
              }
              style={{
                cursor: 'pointer',
                marginBottom: '0.5rem',
                transition: 'all 0.2s ease',
                padding: '1rem',
                backgroundColor: 'var(--gray-2)',
                borderRadius: '6px',
              }}
              className="hover:shadow-md"
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Building2 size={20} style={{ opacity: 0.6 }} />
                <Text size="3" weight="medium">
                  {organization}
                </Text>
              </Box>
            </Box>
          );
        })}
    </CardContainer>
  );
};
