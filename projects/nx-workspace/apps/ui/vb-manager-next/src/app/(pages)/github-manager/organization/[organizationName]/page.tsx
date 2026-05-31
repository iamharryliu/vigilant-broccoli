'use client';
import { use, useEffect, useState, useMemo } from 'react';
import { API_ROUTES } from '../../../../components/github-manager.component';
import {
  GithubTeam,
  GithubTeamMember,
  GithubOrgMember,
  GithubOrgRepository,
} from '@vigilant-broccoli/common-js';
import {
  Heading,
  Link,
  Box,
  Text,
  TextField,
  Callout,
  Badge,
  Grid,
  Button,
  Dialog,
  Flex,
} from '@radix-ui/themes';
import {
  Users,
  Search,
  AlertCircle,
  FileCode,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { CardSkeleton } from '../../../../components/skeleton.component';
import {
  ButtonConfig,
  ButtonList,
  CardContainer,
  CollapsibleList,
  CollapsibleListItemConfig,
  StatusCardList,
  StatusCardListItem,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';

interface OrgMeta {
  organizationName: string;
  avatar_url: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export default function Page({
  params,
}: {
  params: Promise<{ organizationName: string }>;
}) {
  const { organizationName } = use(params);
  const [meta, setMeta] = useState<OrgMeta>();
  const [members, setMembers] = useState<GithubOrgMember[]>();
  const [repositories, setRepositories] = useState<GithubOrgRepository[]>();
  const [teams, setTeams] = useState<GithubTeam[]>();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setError(null);
    setMeta(undefined);
    setMembers(undefined);
    setRepositories(undefined);
    setTeams(undefined);

    const qs = `?organization=${organizationName}`;
    const fail = (label: string) => (err: unknown) =>
      setError(
        err instanceof Error
          ? `Failed to load ${label}: ${err.message}`
          : `Failed to load ${label}`,
      );

    fetchJson<OrgMeta>(`${API_ROUTES.ORGANIZATION_META}${qs}`)
      .then(setMeta)
      .catch(fail('organization'));
    fetchJson<GithubOrgMember[]>(`${API_ROUTES.ORGANIZATION_MEMBERS}${qs}`)
      .then(setMembers)
      .catch(fail('members'));
    fetchJson<GithubOrgRepository[]>(
      `${API_ROUTES.ORGANIZATION_REPOSITORIES}${qs}`,
    )
      .then(setRepositories)
      .catch(fail('repositories'));
    fetchJson<GithubTeam[]>(`${API_ROUTES.ORGANIZATION_TEAMS}${qs}`)
      .then(setTeams)
      .catch(fail('teams'));
  }, [organizationName]);

  const filteredTeams = useMemo(() => {
    if (!teams) return undefined;
    if (!searchQuery.trim()) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter(team => {
      if (team.name.toLowerCase().includes(query)) return true;
      return team.members.some(member =>
        member.username.toLowerCase().includes(query),
      );
    });
  }, [teams, searchQuery]);

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

  return (
    <>
      <Box mb="3">
        <Heading size="7" mb="1">
          <Box style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {meta && (
              <img
                src={meta.avatar_url}
                alt={meta.organizationName}
                style={{ width: '24px', height: '24px', borderRadius: '4px' }}
              />
            )}
            {meta?.organizationName ?? organizationName}
          </Box>
        </Heading>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Text size="1" color="gray">
            {members
              ? `${members.length} member${members.length !== 1 ? 's' : ''}`
              : '… members'}
            {' · '}
            {teams
              ? `${teams.length} team${teams.length !== 1 ? 's' : ''}`
              : '… teams'}
          </Text>
        </Box>
      </Box>

      <Box mb="3">
        <TextField.Root
          placeholder="Search teams or members..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          size="2"
        >
          <TextField.Slot>
            <Search size={16} />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <Grid columns="3" gap="3">
        {repositories ? (
          <RepositoriesList
            repositories={repositories}
            searchQuery={searchQuery}
            organizationName={organizationName}
          />
        ) : (
          <CardSkeleton title="Repositories" rows={5} />
        )}
        {members ? (
          <MembersList
            members={members}
            searchQuery={searchQuery}
            organizationName={organizationName}
            onMemberRemoved={username =>
              setMembers(prev => prev?.filter(m => m.login !== username))
            }
          />
        ) : (
          <CardSkeleton title="Members" rows={5} />
        )}
        {filteredTeams ? (
          <TeamsList
            teams={filteredTeams}
            organizationName={organizationName}
            searchQuery={searchQuery}
          />
        ) : (
          <CardSkeleton title="Teams" rows={5} />
        )}
      </Grid>
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

const getRepoUrls = (repoUrl: string) => ({
  Code: repoUrl,
  Issues: `${repoUrl}/issues`,
  PRs: `${repoUrl}/pulls`,
  Actions: `${repoUrl}/actions`,
  Settings: `${repoUrl}/settings`,
});

const repoToItem = (repo: GithubOrgRepository): StatusCardListItem => ({
  id: repo.name,
  label: repo.name,
  badges: (
    <Badge color={repo.private ? 'gray' : 'green'} size="1">
      {repo.private ? 'Private' : 'Public'}
    </Badge>
  ),
  children: (
    <Flex direction="column" gap="2">
      {repo.description && (
        <Text size="1" color="gray">
          {repo.description}
        </Text>
      )}
      <ButtonList
        buttons={Object.entries(getRepoUrls(repo.html_url)).map(
          ([label, url]): ButtonConfig => ({
            label,
            onClick: () => window.open(url, '_blank', WINDOW_OPEN_FEATURES),
            isExternal: true,
          }),
        )}
      />
    </Flex>
  ),
});

const RepositoriesList = ({
  repositories,
  searchQuery,
  organizationName,
}: {
  repositories: GithubOrgRepository[];
  searchQuery: string;
  organizationName: string;
}) => {
  const filteredRepositories = useMemo(() => {
    const sorted = [...repositories].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter(
      repo =>
        repo.name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query),
    );
  }, [repositories, searchQuery]);

  return (
    <CardContainer
      title="Repositories"
      gap="3"
      headerLink={{
        href: `https://github.com/orgs/${organizationName}/repositories`,
        label: 'View on GitHub',
      }}
    >
      {filteredRepositories.length === 0 && searchQuery ? (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray">
            No repositories match &ldquo;{searchQuery}&rdquo;
          </Text>
        </Box>
      ) : (
        <StatusCardList
          items={filteredRepositories.map(repoToItem)}
          emptyMessage="No repositories found"
        />
      )}
    </CardContainer>
  );
};

const MembersList = ({
  members,
  searchQuery,
  organizationName,
  onMemberRemoved,
}: {
  members: GithubOrgMember[];
  searchQuery: string;
  organizationName: string;
  onMemberRemoved: (username: string) => void;
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const filteredMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) =>
      a.login.localeCompare(b.login, undefined, { sensitivity: 'base' }),
    );
    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter(member => member.login.toLowerCase().includes(query));
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
      { method: 'DELETE' },
    );

    if (response.ok) {
      onMemberRemoved(memberToDelete);
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
      body: JSON.stringify({
        organization: organizationName,
        username: newUsername.trim(),
      }),
    });

    if (response.ok) {
      window.location.reload();
    }
    setIsAdding(false);
  };

  return (
    <>
      <CardContainer
        title="Members"
        headerAction={
          <Flex align="center" gap="2">
            <Button
              size="1"
              variant="soft"
              onClick={() => setAddDialogOpen(true)}
            >
              <UserPlus size={14} />
              Add
            </Button>
            <Link
              href={`https://github.com/orgs/${organizationName}/people`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text
                size="2"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View on GitHub →
              </Text>
            </Link>
          </Flex>
        }
      >
        {filteredMembers.length === 0 && searchQuery && (
          <Box style={{ textAlign: 'center', padding: '2rem' }}>
            <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <Text size="3" color="gray">
              No members match &ldquo;{searchQuery}&rdquo;
            </Text>
          </Box>
        )}

        {filteredMembers.map(member => (
          <Box
            key={member.id}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Link
              href={member.html_url}
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1,
              }}
            >
              <img
                src={member.avatar_url}
                alt={member.login}
                style={{ width: '20px', height: '20px', borderRadius: '4px' }}
              />
              <Text size="2">{member.login}</Text>
            </Link>
            <Link
              href={`${member.html_url}?tab=repositories`}
              target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <FileCode size={14} style={{ opacity: 0.5 }} />
              <Text size="1" color="gray">
                Repos
              </Text>
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
            Are you sure you want to remove <strong>{memberToDelete}</strong>{' '}
            from the organization?
          </Dialog.Description>

          <Box
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
            }}
          >
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="solid"
              color="red"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Removing...' : 'Remove'}
            </Button>
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add Member</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Enter the GitHub username of the person you want to invite to the
            organization.
          </Dialog.Description>

          <TextField.Root
            placeholder="GitHub username"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            size="2"
          />

          <Box
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
              marginTop: '1rem',
            }}
          >
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="solid"
              onClick={handleAddMember}
              disabled={isAdding || !newUsername.trim()}
            >
              {isAdding ? 'Adding...' : 'Add Member'}
            </Button>
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

const TeamsList = ({
  teams,
  organizationName,
  searchQuery,
}: {
  teams: GithubTeam[];
  organizationName: string;
  searchQuery: string;
}) => {
  const teamItems: CollapsibleListItemConfig[] = teams.map(team => ({
    id: team.name,
    titleContent: (
      <Heading size="4">
        <GithubTeamLink organization={organizationName} team={team.name} />
      </Heading>
    ),
    headerAction: (
      <Badge color="gray" size="1">
        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
      </Badge>
    ),
    content: team.members.map(member => (
      <Box
        key={`${team.name}-${member.username}`}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <img
          src={member.avatar_url}
          alt={member.username}
          style={{ width: '20px', height: '20px', borderRadius: '4px' }}
        />
        <Box style={{ flex: 1 }}>
          <GithubUserLink member={member} />
        </Box>
        <Badge
          color={
            member.role === 'admin'
              ? 'red'
              : member.role === 'maintainer'
                ? 'blue'
                : 'gray'
          }
          size="1"
        >
          {member.role}
        </Badge>
      </Box>
    )),
  }));

  return (
    <CardContainer
      title="Teams"
      headerLink={{
        href: `https://github.com/orgs/${organizationName}/teams`,
        label: 'View on GitHub',
      }}
    >
      {teams.length === 0 && searchQuery && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray">
            No teams match &ldquo;{searchQuery}&rdquo;
          </Text>
        </Box>
      )}

      {teams.length === 0 && !searchQuery && (
        <Box style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <Text size="3" color="gray" as="div" mb="1">
            No teams found
          </Text>
          <Text size="2" color="gray">
            This organization doesn&apos;t have any teams yet.
          </Text>
        </Box>
      )}

      <CollapsibleList items={teamItems} />
    </CardContainer>
  );
};
