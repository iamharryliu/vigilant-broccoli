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
        <Skeleton height="60px" mb="4" />
        <Grid columns="3" gap="3" mb="4">
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </Grid>
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
      {member.username} ({member.role})
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
  const totalMembers = item.config.teams.reduce(
    (sum, team) => sum + team.members.length,
    0
  );
  const uniqueMembers = new Set(
    item.config.teams.flatMap(team => team.members.map(m => m.username))
  ).size;

  return (
    <>
      {/* Header */}
      <Box mb="4">
        <Heading size="8" mb="2">
          <Box style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={32} />
            {item.config.organizationName}
          </Box>
        </Heading>
        <Text size="2" color="gray">Organization structure and team members</Text>
      </Box>

      {/* Statistics Cards */}
      <Grid columns="3" gap="3" mb="4">
        <Card>
          <Box style={{ textAlign: 'center' }}>
            <Users size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
            <Text size="6" weight="bold" as="div">{totalTeams}</Text>
            <Text size="2" color="gray">Teams</Text>
          </Box>
        </Card>
        <Card>
          <Box style={{ textAlign: 'center' }}>
            <UserCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
            <Text size="6" weight="bold" as="div">{uniqueMembers}</Text>
            <Text size="2" color="gray">Unique Members</Text>
          </Box>
        </Card>
        <Card>
          <Box style={{ textAlign: 'center' }}>
            <Users size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
            <Text size="6" weight="bold" as="div">{totalMembers}</Text>
            <Text size="2" color="gray">Total Memberships</Text>
          </Box>
        </Card>
      </Grid>

      {/* Search Bar */}
      <Box mb="4">
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
          <Text size="3" color="gray">No teams or members match "{searchQuery}"</Text>
        </Box>
      )}

      {/* Teams List */}
      {item.config.teams.map(team => {
        return (
          <Card key={`${item.id}-${team.name}`} mb="3">
            <Box mb="3">
              <Heading size="5" mb="1">
                <Box style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} />
                  <GithubTeamLink
                    organization={item.config.organizationName}
                    team={team.name}
                  />
                </Box>
              </Heading>
              <Badge color="gray" size="1">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</Badge>
            </Box>
            <Box style={{ display: 'grid', gap: '0.5rem' }}>
              {team.members.map(member => (
                <Box
                  key={`${item.id}-${team.name}-${member.username}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    backgroundColor: 'var(--gray-a2)',
                  }}
                >
                  <UserCircle size={16} style={{ opacity: 0.6 }} />
                  <GithubUserLink member={member} />
                  <Badge
                    color={member.role === 'admin' ? 'red' : member.role === 'maintainer' ? 'blue' : 'gray'}
                    size="1"
                    style={{ marginLeft: 'auto' }}
                  >
                    {member.role}
                  </Badge>
                </Box>
              ))}
            </Box>
          </Card>
        );
      })}
      <Box mt="4">
        <CopyPastable text={JSON.stringify(item.config, null, 2)} />
      </Box>
    </>
  );
};
