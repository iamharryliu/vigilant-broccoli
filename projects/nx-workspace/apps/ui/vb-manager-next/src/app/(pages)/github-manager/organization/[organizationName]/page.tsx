'use client';
import { use, useEffect, useState, useMemo } from 'react';
import { API_ROUTES } from '../../../../components/github-manager.component';
import {
  GithubOrganizationTeamStructure,
  GithubTeamMember,
  GithubOrgMember,
  GithubOrgRepository,
} from '@vigilant-broccoli/common-js';
import { Heading, Link, Box, Text, TextField, Callout, Badge, Grid, Button, Dialog } from '@radix-ui/themes';
import { CopyPastable } from '@vigilant-broccoli/react-lib';
import { Users, Search, AlertCircle, FileCode, Trash2, UserPlus } from 'lucide-react';
import { LinkGroupComponent } from '../../../../components/link-group.component';
import { CardContainer } from '../../../../components/card-container.component';
import { CollapsibleListItem } from '../../../../components/collapsible-list-item.component';
import { LinkList } from '../../../../components/link-list.component';
import { LinkListItemConfig } from '../../../../components/link-list-item.component';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';

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

  return (
    <>
      <Box mb="3">
        <Heading size="7" mb="1">
          <Box style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={organizationStructure.avatar_url}
              alt={organizationStructure.organizationName}
              style={{ width: '24px', height: '24px', borderRadius: '4px' }}
            />
            {organizationStructure.organizationName}
          </Box>
        </Heading>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Text size="1" color="gray">
            {organizationStructure.memberCount} member{organizationStructure.memberCount !== 1 ? 's' : ''} · {organizationStructure.teams.length} team{organizationStructure.teams.length !== 1 ? 's' : ''}
          </Text>
        </Box>
      </Box>

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

      <Grid columns="4" gap="3">
        <RepositoriesList repositories={organizationStructure.repositories} searchQuery={searchQuery} organizationName={organizationStructure.organizationName} />
        <MembersList members={organizationStructure.members} searchQuery={searchQuery} organizationName={organizationStructure.organizationName} />
        <TeamsList structure={filteredStructure || organizationStructure} searchQuery={searchQuery} />
        <OrganizationLinks organizationName={organizationStructure.organizationName} />
      </Grid>

      <Box mt="3">
        <CopyPastable text={JSON.stringify(organizationStructure, null, 2)} />
      </Box>
    </>
  );
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

const RepositoriesList = ({ repositories, searchQuery, organizationName }: { repositories: GithubOrgRepository[]; searchQuery: string; organizationName: string }) => {
  const filteredRepositories = useMemo(() => {
    if (!searchQuery.trim()) return repositories;
    const query = searchQuery.toLowerCase();
    return repositories.filter(repo =>
      repo.name.toLowerCase().includes(query) ||
      repo.description?.toLowerCase().includes(query)
    );
  }, [repositories, searchQuery]);

  const linkItems = useMemo<LinkListItemConfig[]>(() => {
    return filteredRepositories.map(repo => ({
      text: repo.name,
      url: repo.html_url,
      badge: {
        text: repo.private ? 'Private' : 'Public',
      },
    }));
  }, [filteredRepositories]);

  return (
    <CardContainer
      title={`Repositories (${filteredRepositories.length})`}
      headerAction={
        <Link href={`https://github.com/orgs/${organizationName}/repositories`} target="_blank">
          <Text size="2" color="gray" style={{ cursor: 'pointer' }}>View on GitHub →</Text>
        </Link>
      }
    >
      {filteredRepositories.length === 0 && searchQuery ? (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray">No repositories match &ldquo;{searchQuery}&rdquo;</Text>
        </Box>
      ) : (
        <LinkList items={linkItems} emptyMessage="No repositories found" />
      )}
    </CardContainer>
  );
};

const MembersList = ({ members, searchQuery, organizationName }: { members: GithubOrgMember[]; searchQuery: string; organizationName: string }) => {
  const [filteredMembers, setFilteredMembers] = useState<GithubOrgMember[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const filtered = !searchQuery.trim()
      ? members
      : members.filter(member => member.login.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredMembers(filtered);
  }, [members, searchQuery]);

  const handleDeleteClick = (username: string) => {
    setMemberToDelete(username);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    const response = await fetch(
      `/api/github/organization-members?organization=${organizationName}&username=${memberToDelete}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      setFilteredMembers(prev => prev.filter(m => m.login !== memberToDelete));
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
    setIsDeleting(false);
  };

  const handleAddMember = async () => {
    if (!newUsername.trim()) return;

    setIsAdding(true);
    const response = await fetch('/api/github/organization-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization: organizationName, username: newUsername.trim() }),
    });

    if (response.ok) {
      window.location.reload();
    }
    setIsAdding(false);
  };

  return (
    <>
      <CardContainer
        title={`Members (${filteredMembers.length})`}
        headerAction={
          <Box style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button size="1" variant="soft" onClick={() => setAddDialogOpen(true)}>
              <UserPlus size={14} />
              Add
            </Button>
            <Link href={`https://github.com/orgs/${organizationName}/people`} target="_blank">
              <Text size="2" color="gray" style={{ cursor: 'pointer' }}>View on GitHub →</Text>
            </Link>
          </Box>
        }
      >
        {filteredMembers.length === 0 && searchQuery && (
          <Box style={{ textAlign: 'center', padding: '2rem' }}>
            <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <Text size="3" color="gray">No members match &ldquo;{searchQuery}&rdquo;</Text>
          </Box>
        )}

        {filteredMembers.map(member => (
          <Box key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href={member.html_url} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <img
                src={member.avatar_url}
                alt={member.login}
                style={{ width: '20px', height: '20px', borderRadius: '4px' }}
              />
              <Text size="2">{member.login}</Text>
            </Link>
            <Link href={`${member.html_url}?tab=repositories`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FileCode size={14} style={{ opacity: 0.5 }} />
              <Text size="1" color="gray">Repos</Text>
            </Link>
            <Button
              size="1"
              variant="ghost"
              color="red"
              onClick={() => handleDeleteClick(member.login)}
              style={{ cursor: 'pointer' }}
            >
              <Trash2 size={14} />
            </Button>
          </Box>
        ))}
      </CardContainer>

      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Remove Member</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to remove <strong>{memberToDelete}</strong> from the organization?
          </Dialog.Description>

          <Box style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant="solid" color="red" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Removing...' : 'Remove'}
            </Button>
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add Member</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Enter the GitHub username of the person you want to invite to the organization.
          </Dialog.Description>

          <TextField.Root
            placeholder="GitHub username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            size="2"
          />

          <Box style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant="solid" onClick={handleAddMember} disabled={isAdding || !newUsername.trim()}>
              {isAdding ? 'Adding...' : 'Add Member'}
            </Button>
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

const TeamsList = ({ structure, searchQuery }: { structure: GithubOrganizationTeamStructure; searchQuery: string }) => {
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({});

  const toggleTeam = (teamName: string) => {
    setOpenTeams(prev => ({
      ...prev,
      [teamName]: !prev[teamName],
    }));
  };

  return (
    <CardContainer
      title={`Teams (${structure.teams.length})`}
      headerAction={
        <Link href={`https://github.com/orgs/${structure.organizationName}/teams`} target="_blank">
          <Text size="2" color="gray" style={{ cursor: 'pointer' }}>View on GitHub →</Text>
        </Link>
      }
    >
      {structure.teams.length === 0 && searchQuery && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray">No teams match &ldquo;{searchQuery}&rdquo;</Text>
        </Box>
      )}

      {structure.teams.length === 0 && !searchQuery && (
        <Box style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray" as="div" mb="1">No teams found</Text>
          <Text size="2" color="gray">This organization doesn&apos;t have any teams yet.</Text>
        </Box>
      )}

      {structure.teams.map(team => {
        const isOpen = openTeams[team.name] ?? false;
        return (
          <CollapsibleListItem
            key={team.name}
            isOpen={isOpen}
            setIsOpen={() => toggleTeam(team.name)}
            titleContent={
              <Heading size="4">
                <GithubTeamLink
                  organization={structure.organizationName}
                  team={team.name}
                />
              </Heading>
            }
            headerAction={
              <Badge color="gray" size="1">
                {team.members.length} member{team.members.length !== 1 ? 's' : ''}
              </Badge>
            }
          >
            {team.members.map(member => (
              <Box key={`${team.name}-${member.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={member.avatar_url}
                  alt={member.username}
                  style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                />
                <Box style={{ flex: 1 }}>
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
          </CollapsibleListItem>
        );
      })}
    </CardContainer>
  );
};

const OrganizationLinks = ({ organizationName }: { organizationName: string }) => {
  const links = [
    {
      label: 'Organization Home',
      target: `https://github.com/${organizationName}`,
      type: OPEN_TYPE.BROWSER,
    },
    {
      label: 'Members',
      target: `https://github.com/orgs/${organizationName}/people`,
      type: OPEN_TYPE.BROWSER,
    },
    {
      label: 'Teams',
      target: `https://github.com/orgs/${organizationName}/teams`,
      type: OPEN_TYPE.BROWSER,
    },
    {
      label: 'Repositories',
      target: `https://github.com/orgs/${organizationName}/repositories`,
      type: OPEN_TYPE.BROWSER,
    },
    {
      label: 'Organization Settings',
      target: `https://github.com/organizations/${organizationName}/settings/profile`,
      type: OPEN_TYPE.BROWSER,
    },
    {
      label: 'Billing Settings',
      target: `https://github.com/organizations/${organizationName}/settings/billing`,
      type: OPEN_TYPE.BROWSER,
    },
  ];

  return <LinkGroupComponent title="Quick Links" links={links} alphabetical={false} />;
};
