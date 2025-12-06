'use client';

import { Card, Heading, TextField, Box, Text, Skeleton, Callout } from '@radix-ui/themes';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Search, AlertCircle } from 'lucide-react';

export const API_ROUTES = {
  ORGANIZATION_STRUCTURE: '/api/github/organization-structure',
  USER_ORGANIZATIONS: '/api/github/user/organizations',
};

// eslint-disable-next-line complexity
export const GithubTeamManager = () => {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
        setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Filter organizations based on search query
  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) return organizations;
    const query = searchQuery.toLowerCase();
    return organizations.filter(org => org.toLowerCase().includes(query));
  }, [organizations, searchQuery]);

  return (
    <Card>
      <Box mb="4">
        <Heading size="6" mb="2">Github Organizations</Heading>
        <Text size="2" color="gray">
          {loading ? 'Loading...' : `${organizations.length} organization${organizations.length !== 1 ? 's' : ''} available`}
        </Text>
      </Box>

      {/* Search Bar */}
      {!loading && !error && organizations.length > 0 && (
        <Box mb="3">
          <TextField.Root
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="2"
          >
            <TextField.Slot>
              <Search size={16} />
            </TextField.Slot>
          </TextField.Root>
        </Box>
      )}

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
            <Card key={i} mb="2">
              <Skeleton height="40px" />
            </Card>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && organizations.length === 0 && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray">No organizations found</Text>
        </Box>
      )}

      {/* No Search Results */}
      {!loading && !error && organizations.length > 0 && filteredOrganizations.length === 0 && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray">No organizations match "{searchQuery}"</Text>
        </Box>
      )}

      {/* Organizations List */}
      {!loading && !error && filteredOrganizations.map(organization => {
        return (
          <Card
            key={organization}
            onClick={() => router.push(`github-manager/organization/${organization}`)}
            style={{
              cursor: 'pointer',
              marginBottom: '0.5rem',
              transition: 'all 0.2s ease',
            }}
            className="hover:shadow-md"
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building2 size={20} style={{ opacity: 0.6 }} />
              <Text size="3" weight="medium">{organization}</Text>
            </Box>
          </Card>
        );
      })}
    </Card>
  );
};
