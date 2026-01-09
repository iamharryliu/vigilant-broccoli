'use client';
import { use, useEffect, useState, useMemo } from 'react';
import { API_ROUTES } from '../../../../components/github-manager.component';
import {
  GithubOrganizationTeamStructure,
  GithubTeamMember,
} from '@vigilant-broccoli/common-js';
import { Card, Heading, Link, Box, Text, TextField, Skeleton, Callout, Badge, Grid } from '@radix-ui/themes';
import { CopyPastable } from '@vigilant-broccoli/react-lib';
import { Users, Search, AlertCircle, Building2, UserCircle } from 'lucide-react';

export default function Page({
  params,
}: {
  params: Promise<{ organizationName: string }>;
}) {
  const { organizationName } = use(params);
  const [organizationStructure, setOrganizationStructure] =
    useState<GithubOrganizationTeamStructure>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_ROUTES.ORGANIZATION_STRUCTURE}?organization=${organizationName}`,
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch organization structure: ${res.statusText}`);
        }

        const structure = await res.json();
        setOrganizationStructure(structure);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organization structure');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [organizationName]);

  // Filter teams based on search query
  const filteredStructure = useMemo(() => {
    if (!organizationStructure || !searchQuery.trim()) return organizationStructure;

    const query = searchQuery.toLowerCase();
    const filteredTeams = organizationStructure.teams.filter(team => {
      // Search in team name
      if (team.name.toLowerCase().includes(query)) return true;

      // Search in member usernames
      return team.members.some(member =>
        member.username.toLowerCase().includes(query)
      );
    });

    return {
      ...organizationStructure,
      teams: filteredTeams,
    };
  }, [organizationStructure, searchQuery]);

  if (loading) {
    return (
      <Box>
        <Skeleton height="50px" mb="3" />
        <Grid columns="2" gap="2" mb="3">
          <Skeleton height="60px" />
          <Skeleton height="60px" />
        </Grid>
        <Skeleton height="32px" mb="3" />
        <Skeleton height="400px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Callout.Root color="red">
        <Callout.Icon>
          <AlertCircle size={16} />
        </Callout.Icon>
        <Callout.Text>{error}</Callout.Text>
      </Callout.Root>
    );
  }

  if (!organizationStructure) return null;

  return <Structure item={{ id: '1', config: filteredStructure || organizationStructure }} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
}

const GithubTeamLink = ({
  organization,
  team,
}: {
  organization: string;
  team: string;
}) => {
  return (
    <Link
      href={`https://github.com/orgs/${organization}/teams/${team}`}
      target="_blank"
    >
      {team}
    </Link>
  );
};

const GithubUserLink = ({ member }: { member: GithubTeamMember }) => {
  return (
    <Link href={`https://github.com/${member.username}`} target="_blank">
      {member.username}
    </Link>
  );
};

const Structure = ({
  item,
  searchQuery,
  setSearchQuery,
}: {
  item: { id: string; config: GithubOrganizationTeamStructure };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  // Calculate statistics
  const totalTeams = item.config.teams.length;
  const uniqueMembers = new Set(
    item.config.teams.flatMap(team => team.members.map(m => m.username))
  ).size;

  return (
    <>
      {/* Header */}
      <Box mb="3">
        <Heading size="7" mb="1">
          <Box style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={24} />
            {item.config.organizationName}
          </Box>
        </Heading>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Text size="1" color="gray">
            {totalTeams} team{totalTeams !== 1 ? 's' : ''} · {uniqueMembers} member{uniqueMembers !== 1 ? 's' : ''}
          </Text>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box mb="3">
        <TextField.Root
          placeholder="Search teams or members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="2"
        >
          <TextField.Slot>
            <Search size={16} />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      {/* No Results State */}
      {item.config.teams.length === 0 && searchQuery && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray">No teams or members match &ldquo;{searchQuery}&rdquo;</Text>
        </Box>
      )}

      {/* Empty State - No Teams */}
      {item.config.teams.length === 0 && !searchQuery && (
        <Box style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray" as="div" mb="1">No teams found</Text>
          <Text size="2" color="gray">This organization doesn&apos;t have any teams yet.</Text>
        </Box>
      )}

      {/* Teams List */}
      {item.config.teams.map(team => {
        return (
          <Card key={`${item.id}-${team.name}`} mb="2">
            <Box mb="2">
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <Heading size="4">
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} />
                    <GithubTeamLink
                      organization={item.config.organizationName}
                      team={team.name}
                    />
                  </Box>
                </Heading>
                <Badge color="gray" size="1">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</Badge>
              </Box>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {team.members.map(member => (
                <Box
                  key={`${item.id}-${team.name}-${member.username}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 0.5rem',
                    borderRadius: '0.25rem',
                    backgroundColor: 'var(--gray-a2)',
                  }}
                >
                  <UserCircle size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <GithubUserLink member={member} />
                  </Box>
                  <Badge
                    color={member.role === 'admin' ? 'red' : member.role === 'maintainer' ? 'blue' : 'gray'}
                    size="1"
                  >
                    {member.role}
                  </Badge>
                </Box>
              ))}
            </Box>
          </Card>
        );
      })}
      <Box mt="3">
        <CopyPastable text={JSON.stringify(item.config, null, 2)} />
      </Box>
    </>
  );
};
