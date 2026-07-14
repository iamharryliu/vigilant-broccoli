'use client';
import { use, useEffect, useState, useMemo } from 'react';
import { API_ROUTES } from '../../../../components/github-manager.component';
import {
  GithubTeam,
  GithubTeamMember,
  GithubOrgMember,
  GithubOrgRepository,
  GITHUB_ORG_URLS,
} from '@vigilant-broccoli/github-workspace-js';
import { Heading, Link, Text, Callout, Badge, Dialog } from '@radix-ui/themes';
import { AlertCircle, Plus } from 'lucide-react';
import { authFetch } from '../../../../../../libs/auth';

import {
  CardSkeleton,
  Skeleton,
} from '../../../../components/skeleton.component';
import {
  Avatar,
  Button,
  ButtonConfig,
  ButtonList,
  CardContainer,
  EllipsisCTA,
  Input,
  SearchInput,
  StatusCardList,
  StatusCardListItem,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';

const ORG_MEMBER_API = '/api/github/organization-members';

interface OrgMeta {
  organizationName: string;
  avatar_url: string;
  isOrgAdmin: boolean;
  repoCount: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await authFetch(url);
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
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          avatarUrl={meta?.avatar_url}
          fallback={organizationName[0].toUpperCase()}
          size="large"
        />
        <div>
          <Heading size="6">
            {meta?.organizationName ?? organizationName}
          </Heading>
          <div className="flex items-center gap-2">
            {meta ? (
              <Text size="2" color="gray">
                {meta.repoCount} repo{meta.repoCount !== 1 ? 's' : ''}
              </Text>
            ) : (
              <Skeleton className="h-4 w-12" />
            )}
            <Text size="2" color="gray">
              ·
            </Text>
            {members ? (
              <Text size="2" color="gray">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </Text>
            ) : (
              <Skeleton className="h-4 w-16" />
            )}
            <Text size="2" color="gray">
              ·
            </Text>
            {teams ? (
              <Text size="2" color="gray">
                {teams.length} team{teams.length !== 1 ? 's' : ''}
              </Text>
            ) : (
              <Skeleton className="h-4 w-12" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {repositories ? (
          <RepositoriesList
            repositories={repositories}
            organizationName={organizationName}
            isOrgAdmin={meta?.isOrgAdmin ?? false}
          />
        ) : (
          <CardSkeleton title="Repositories" rows={5} />
        )}
        {members ? (
          <MembersList
            members={members}
            organizationName={organizationName}
            onMemberRemoved={username =>
              setMembers(prev => prev?.filter(m => m.login !== username))
            }
          />
        ) : (
          <CardSkeleton title="Members" rows={5} />
        )}
        {teams ? (
          <TeamsList teams={teams} organizationName={organizationName} />
        ) : (
          <CardSkeleton title="Teams" rows={5} />
        )}
      </div>
    </>
  );
}

const GithubTeamLink = ({
  organization,
  team,
}: {
  organization: string;
  team: string;
}) => (
  <Link href={GITHUB_ORG_URLS.team(organization, team)} target="_blank">
    {team}
  </Link>
);

const GithubUserLink = ({ member }: { member: GithubTeamMember }) => (
  <Link href={GITHUB_ORG_URLS.member(member.username)} target="_blank">
    {member.username}
  </Link>
);

const getRepoUrls = (repoUrl: string) => ({
  Code: repoUrl,
  Issues: `${repoUrl}/issues`,
  PRs: `${repoUrl}/pulls`,
  Actions: `${repoUrl}/actions`,
  Settings: `${repoUrl}/settings`,
});

const memberToItem = (
  member: GithubOrgMember,
  organizationName: string,
  onMemberRemoved: (username: string) => void,
): StatusCardListItem => ({
  id: String(member.id),
  label: member.login,
  badges: (
    <div className="flex items-center gap-2">
      {member.public_repos !== undefined && (
        <Badge color="blue" size="1">
          {member.public_repos} repos
        </Badge>
      )}
      {member.role && (
        <Badge color={member.role === 'admin' ? 'red' : 'gray'} size="1">
          {member.role}
        </Badge>
      )}
      <Avatar avatarUrl={member.avatar_url} size="xsmall" />
    </div>
  ),
  actions: (
    <EllipsisCTA
      onDelete={async () => {
        const response = await authFetch(
          `${ORG_MEMBER_API}?organization=${organizationName}&username=${member.login}`,
          { method: 'DELETE' },
        );
        if (response.ok) onMemberRemoved(member.login);
      }}
      confirmDescription={`Remove ${member.login} from the organization?`}
    />
  ),
  children: (
    <ButtonList
      buttons={[
        {
          label: 'Profile',
          onClick: () =>
            window.open(
              GITHUB_ORG_URLS.member(member.login),
              '_blank',
              WINDOW_OPEN_FEATURES,
            ),
          isExternal: true,
        },
        {
          label: 'Repos',
          onClick: () =>
            window.open(
              GITHUB_ORG_URLS.memberRepos(member.login),
              '_blank',
              WINDOW_OPEN_FEATURES,
            ),
          isExternal: true,
        },
      ]}
    />
  ),
});

const repoToItem = (
  repo: GithubOrgRepository,
  organizationName: string,
  onRepoDeleted: (repoName: string) => void,
  isOrgAdmin: boolean,
): StatusCardListItem => ({
  id: repo.name,
  label: repo.name,
  badges: (
    <Badge color={repo.private ? 'gray' : 'green'} size="1">
      {repo.private ? 'Private' : 'Public'}
    </Badge>
  ),
  actions: isOrgAdmin ? (
    <EllipsisCTA
      onDelete={async () => {
        const response = await authFetch(
          `${API_ROUTES.ORGANIZATION_REPOSITORIES}?organization=${organizationName}&repo=${repo.name}`,
          { method: 'DELETE' },
        );
        if (response.ok) onRepoDeleted(repo.name);
      }}
      confirmDescription={`Delete repository "${repo.name}"? This cannot be undone.`}
    />
  ) : undefined,
  children: (
    <div className="flex flex-col gap-2">
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
    </div>
  ),
});

const NoResults = ({ query, label }: { query: string; label: string }) => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <Text size="3" color="gray">
      No {label} match &ldquo;{query}&rdquo;
    </Text>
  </div>
);

const AddItemDialog = ({
  title,
  placeholder,
  buttonLabel,
  onAdd,
}: {
  title: string;
  placeholder: string;
  buttonLabel: string;
  onAdd: (value: string) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!value.trim()) return;
    setIsAdding(true);
    await onAdd(value.trim());
    setValue('');
    setIsAdding(false);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button size="sm" variant="outline" className="w-full">
          <Plus size={12} />
          {buttonLabel}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 400 }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="mt-3"
        />
        <div className="flex gap-2 justify-end mt-3">
          <Dialog.Close>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
          <Button
            onClick={handleAdd}
            disabled={!value.trim()}
            loading={isAdding}
          >
            {buttonLabel}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const RepositoriesList = ({
  repositories: initialRepositories,
  organizationName,
  isOrgAdmin,
}: {
  repositories: GithubOrgRepository[];
  organizationName: string;
  isOrgAdmin: boolean;
}) => {
  const [repositories, setRepositories] = useState(initialRepositories);
  const [searchQuery, setSearchQuery] = useState('');

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
        href: GITHUB_ORG_URLS.repositories(organizationName),
        label: 'View Repositories',
      }}
    >
      <div className="mb-2">
        <SearchInput
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <AddItemDialog
        title="Create Repository"
        placeholder="Repository name..."
        buttonLabel="Create Repository"
        onAdd={async repoName => {
          const response = await authFetch(
            API_ROUTES.ORGANIZATION_REPOSITORIES,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                organization: organizationName,
                repoName,
              }),
            },
          );
          if (response.ok)
            setRepositories(prev => [
              ...prev,
              {
                name: repoName,
                html_url: `https://github.com/${organizationName}/${repoName}`,
                description: null,
                private: true,
                fork: false,
                archived: false,
                stargazers_count: 0,
                language: null,
                updated_at: new Date().toISOString(),
              },
            ]);
        }}
      />
      {filteredRepositories.length === 0 && searchQuery ? (
        <NoResults query={searchQuery} label="repositories" />
      ) : (
        <StatusCardList
          items={filteredRepositories.map(repo =>
            repoToItem(
              repo,
              organizationName,
              name =>
                setRepositories(prev => prev.filter(r => r.name !== name)),
              isOrgAdmin,
            ),
          )}
          emptyMessage="No repositories found"
        />
      )}
    </CardContainer>
  );
};

const MembersList = ({
  members,
  organizationName,
  onMemberRemoved,
}: {
  members: GithubOrgMember[];
  organizationName: string;
  onMemberRemoved: (username: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) => {
      if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
      return a.login.localeCompare(b.login, undefined, { sensitivity: 'base' });
    });
    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter(member => member.login.toLowerCase().includes(query));
  }, [members, searchQuery]);

  return (
    <CardContainer
      title="Members"
      headerLink={{
        href: GITHUB_ORG_URLS.people(organizationName),
        label: 'View Members',
      }}
    >
      <div className="mb-2">
        <SearchInput
          placeholder="Search members..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <AddItemDialog
        title="Add Member"
        placeholder="GitHub username..."
        buttonLabel="Add Member"
        onAdd={async username => {
          await authFetch(ORG_MEMBER_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organization: organizationName, username }),
          });
          window.location.reload();
        }}
      />
      {filteredMembers.length === 0 && searchQuery ? (
        <NoResults query={searchQuery} label="members" />
      ) : (
        <StatusCardList
          items={filteredMembers.map(member =>
            memberToItem(member, organizationName, onMemberRemoved),
          )}
          emptyMessage="No members found"
        />
      )}
    </CardContainer>
  );
};

const teamMemberRow = (team: GithubTeam, member: GithubTeamMember) => (
  <div
    key={`${team.name}-${member.username}`}
    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
  >
    <Avatar avatarUrl={member.avatar_url} size="xsmall" />
    <div style={{ flex: 1 }}>
      <GithubUserLink member={member} />
    </div>
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
  </div>
);

const teamToItem = (
  team: GithubTeam,
  organizationName: string,
  onTeamDeleted: (teamName: string) => void,
): StatusCardListItem => ({
  id: team.name,
  label: team.name,
  badges: (
    <Text size="2" weight="bold">
      <GithubTeamLink organization={organizationName} team={team.name} />
    </Text>
  ),
  actions: (
    <EllipsisCTA
      onDelete={async () => {
        const response = await authFetch(
          `/api/github/organization/teams?organization=${organizationName}&team=${encodeURIComponent(team.name)}`,
          { method: 'DELETE' },
        );
        if (response.ok) onTeamDeleted(team.name);
      }}
      confirmDescription={`Delete team "${team.name}" from the organization?`}
    />
  ),
  children: (
    <div className="flex flex-col gap-2">
      <Badge color="gray" size="1" style={{ alignSelf: 'flex-start' }}>
        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
      </Badge>
      {team.members.length === 0 ? (
        <Text size="1" color="gray">
          No members
        </Text>
      ) : (
        team.members.map(member => teamMemberRow(team, member))
      )}
    </div>
  ),
});

const TeamsList = ({
  teams: initialTeams,
  organizationName,
}: {
  teams: GithubTeam[];
  organizationName: string;
}) => {
  const [teams, setTeams] = useState(initialTeams);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter(
      team =>
        team.name.toLowerCase().includes(query) ||
        team.members.some(m => m.username.toLowerCase().includes(query)),
    );
  }, [teams, searchQuery]);

  return (
    <CardContainer
      title="Teams"
      headerLink={{
        href: GITHUB_ORG_URLS.teams(organizationName),
        label: 'View Teams',
      }}
    >
      <div className="mb-2">
        <SearchInput
          placeholder="Search teams..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <AddItemDialog
        title="Create Team"
        placeholder="Team name..."
        buttonLabel="Create Team"
        onAdd={async teamName => {
          const response = await authFetch(API_ROUTES.ORGANIZATION_TEAMS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organization: organizationName, teamName }),
          });
          if (response.ok)
            setTeams(prev => [
              ...prev,
              { name: teamName, members: [], repositories: [], teams: [] },
            ]);
        }}
      />
      {filteredTeams.length === 0 && searchQuery ? (
        <NoResults query={searchQuery} label="teams" />
      ) : (
        <StatusCardList
          items={filteredTeams.map(team =>
            teamToItem(team, organizationName, name =>
              setTeams(prev => prev.filter(t => t.name !== name)),
            ),
          )}
          emptyMessage="No teams found"
        />
      )}
    </CardContainer>
  );
};
