import { ShellUtils } from '@vigilant-broccoli/common-node';
import { GithubCLICommand } from './github-commands';
import { GithubUtils } from './github.utils';
import {
  GithubTeam,
  GithubTeamMember,
  GithubTeamsDTO,
  GithubOrgMember,
  GithubOrgBasic,
  GithubOrgRepository,
  GithubOrganizationTeamStructure,
} from '@vigilant-broccoli/github-workspace-js';
import { toSlug } from '@vigilant-broccoli/common-js';
import { GithubPagesSite } from './github.models';

async function getOwnedOrganizations(): Promise<GithubOrgBasic[]> {
  const res = await ShellUtils.runShellCommand(
    `gh api user/memberships/orgs --paginate`,
    true,
  );

  if (!res) {
    return [];
  }

  const memberships = JSON.parse(res as string);
  const adminOrgs = memberships
    .filter((m: { role: string }) => m.role === 'admin')
    .map((m: { organization: { login: string; avatar_url: string } }) => ({
      login: m.organization.login,
      avatar_url: m.organization.avatar_url,
    }));

  return adminOrgs;
}

async function getOrgStructure(
  org: string,
): Promise<GithubOrganizationTeamStructure> {
  const allTeams = await GithubService.getTeamsData(org);
  const tree = await GithubUtils.buildTeamTree(org, allTeams);
  const members = await GithubService.getOrgMembers(org);
  const orgData = await GithubService.getOrgData(org);
  const repositories = await GithubService.getOrgRepositories(org);

  return {
    organizationName: org,
    avatar_url: orgData.avatar_url,
    memberCount: members.length,
    members,
    repositories,
    teams: tree,
  };
}

async function getTeamMembers(organizationName: string, team: GithubTeam) {
  const teamSlug = toSlug(team.name);
  return await ShellUtils.runShellCommand(
    GithubCLICommand.getTeamMembers(organizationName, teamSlug),
    true,
  );
}

async function getTeamsData(
  organizationName: string,
): Promise<GithubTeamsDTO[]> {
  const teamsData = (await ShellUtils.runShellCommand(
    GithubCLICommand.getTeamsData(organizationName),
    true,
  )) as string;
  return JSON.parse(teamsData) as GithubTeamsDTO[];
}

async function getOrgData(org: string): Promise<{ avatar_url: string }> {
  const orgData = (await ShellUtils.runShellCommand(
    GithubCLICommand.getOrgData(org),
    true,
  )) as string;
  return JSON.parse(orgData);
}

async function getOrgMembershipRole(org: string): Promise<'admin' | 'member'> {
  const role = (await ShellUtils.runShellCommand(
    GithubCLICommand.getOrgMembershipRole(org),
    true,
  )) as string;
  return role.trim().replace(/^"|"$/g, '') as 'admin' | 'member';
}

async function getOrgMembers(org: string): Promise<GithubOrgMember[]> {
  const [membersData, adminsData] = await Promise.all([
    ShellUtils.runShellCommand(
      GithubCLICommand.getOrgMembers(org),
      true,
    ) as Promise<string>,
    ShellUtils.runShellCommand(
      GithubCLICommand.getOrgAdmins(org),
      true,
    ) as Promise<string>,
  ]);
  const parsedMembers = JSON.parse(membersData);
  const parsedAdmins = JSON.parse(adminsData);
  const members: GithubOrgMember[] = Array.isArray(parsedMembers)
    ? parsedMembers
    : [];
  const adminLogins = new Set<string>(
    (Array.isArray(parsedAdmins) ? parsedAdmins : []).map(
      (a: GithubOrgMember) => a.login,
    ),
  );
  return members.map(m => ({
    ...m,
    role: adminLogins.has(m.login) ? 'admin' : 'member',
  }));
}

async function getOrgMembersCount(org: string): Promise<number> {
  const members = await GithubService.getOrgMembers(org);
  return members.length;
}

async function getOrgRepositories(org: string): Promise<GithubOrgRepository[]> {
  const reposData = (await ShellUtils.runShellCommand(
    GithubCLICommand.getOrgRepositories(org),
    true,
  )) as string;
  const repos = JSON.parse(reposData);
  return Array.isArray(repos) ? repos : [];
}
async function getTeamMemberMembership(
  organizationName: string,
  teamSlug: string,
  memberUsername: string,
): Promise<GithubTeamMember> {
  const data = (await ShellUtils.runShellCommand(
    GithubCLICommand.getTeamMemberMembership(
      organizationName,
      teamSlug,
      memberUsername,
    ),
    true,
  )) as string;
  const membershipData = JSON.parse(data);
  return {
    username: memberUsername,
    role: membershipData.role,
    avatar_url: membershipData.member?.avatar_url || '',
  };
}
function getTeamAndDescendants(
  all: GithubTeamsDTO[],
  slug: string,
): GithubTeamsDTO[] {
  const team = all.find(team => team.slug === slug);
  const children = all.filter(team => team.parent && team.parent.slug === slug);
  const descendants = children.flatMap(child =>
    GithubService.getTeamAndDescendants(all, child.slug),
  );
  return team ? [team, ...descendants] : descendants;
}

async function updateTeamRepositories(
  organizationName: string,
  team: GithubTeam,
) {
  const teamSlug = toSlug(team.name);
  if (team.repositories && team.repositories.length > 0) {
    for (const repo of team.repositories) {
      console.log(
        `Syncing repo ${repo.name} to team ${team.name} with permission ${repo.permission}`,
      );
      await ShellUtils.runShellCommand(
        GithubCLICommand.updateTeamRepo(
          organizationName,
          teamSlug,
          repo.name,
          repo.permission,
        ),
      );
    }
  }
}

async function updateTeamMembers(organizationName: string, team: GithubTeam) {
  const teamSlug = toSlug(team.name);
  for (const member of team.members) {
    console.log(
      `Syncing member ${member.username} to team ${team.name} with role ${member.role}`,
    );
    await ShellUtils.runShellCommand(
      GithubCLICommand.updateTeamMember(organizationName, teamSlug, member),
    );
  }
}

async function removeMembersNotInConfig(
  organizationName: string,
  team: GithubTeam,
) {
  const teamSlug = toSlug(team.name);
  const data = (await ShellUtils.runShellCommand(
    GithubCLICommand.getTeamMembers(organizationName, teamSlug),
    true,
  )) as string;
  const existingMembers = JSON.parse(data).map(
    (member: { login: string }) => member.login,
  );
  for (const member of existingMembers) {
    if (!team.members.map(m => m.username).includes(member)) {
      console.log(
        `Removing member ${member} from team ${team.name} as they are not in the configuration`,
      );
      await ShellUtils.runShellCommand(
        GithubCLICommand.removeTeamMember(organizationName, teamSlug, member),
      );
    }
  }
}
async function deleteTeam(organizationName: string, teamName: string) {
  const teamSlug = toSlug(teamName);
  await ShellUtils.runShellCommand(
    GithubCLICommand.deleteTeam(organizationName, teamSlug),
  );
}

async function deleteAllTeams(organizationName: string) {
  const teamsData = await GithubService.getTeamsData(organizationName);
  console.log('Deleting all teams for organization:', organizationName);
  const rootTeams = teamsData.filter(team => !team.parent);
  await Promise.all(
    rootTeams.map(team => {
      console.log(`Deleting root team: ${team.name}`);
      return ShellUtils.runShellCommand(
        GithubCLICommand.deleteTeam(organizationName, team.slug),
      );
    }),
  );
}

async function listPagesSites(): Promise<GithubPagesSite[]> {
  const reposOutput = (await ShellUtils.runShellCommand(
    GithubCLICommand.listPagesRepos(),
    true,
  )) as string;

  if (!reposOutput) return [];

  const repos = reposOutput
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line) as { full_name: string; html_url: string });

  const sites = await Promise.all(
    repos.map(async repo => {
      const pagesOutput = (await ShellUtils.runShellCommand(
        GithubCLICommand.getRepoPages(repo.full_name),
        true,
      )) as string;
      const pages = JSON.parse(pagesOutput);
      return {
        fullName: repo.full_name,
        repoUrl: repo.html_url,
        pagesUrl: pages.html_url,
        status: pages.status,
        cname: pages.cname,
      };
    }),
  );

  return sites;
}

async function createOrgTeam(organizationName: string, teamName: string) {
  await ShellUtils.runShellCommand(
    GithubCLICommand.createTeam(organizationName, teamName),
  );
}

async function createOrgRepo(organizationName: string, repoName: string) {
  await ShellUtils.runShellCommand(
    GithubCLICommand.createOrgRepo(organizationName, repoName),
  );
}

async function deleteOrgRepo(organizationName: string, repoName: string) {
  await ShellUtils.runShellCommand(
    GithubCLICommand.deleteOrgRepo(organizationName, repoName),
  );
}

async function addOrgMember(organizationName: string, username: string) {
  return await ShellUtils.runShellCommand(
    GithubCLICommand.addOrgMember(organizationName, username),
  );
}

async function removeOrgMember(organizationName: string, username: string) {
  return await ShellUtils.runShellCommand(
    GithubCLICommand.removeOrgMember(organizationName, username),
  );
}

function setSecret(repo: string, key: string, value: string): void {
  ShellUtils.runShellCommand(
    `gh secret set ${key} --repo ${repo} --body "${value}"`,
  );
  console.log(`✅ GitHub: Set secret ${key}`);
}

async function setSecrets(
  repo: string,
  secrets: Record<string, string>,
  prefix = '',
): Promise<void> {
  for (const [key, value] of Object.entries(secrets)) {
    setSecret(repo, `${prefix}${key}`, value);
  }
}

export const GithubService = {
  // READ
  getOwnedOrganizations,
  getOrgStructure,
  getOrgData,
  getOrgMembershipRole,
  getTeamsData,
  getTeamMembers,
  getOrgMembers,
  getOrgMembersCount,
  getOrgRepositories,
  getTeamMemberMembership,
  getTeamAndDescendants,
  listPagesSites,
  // UPDATE
  updateTeamRepositories,
  updateTeamMembers,
  createOrgTeam,
  createOrgRepo,
  deleteOrgRepo,
  addOrgMember,
  // DELETE
  removeMembersNotInConfig,
  removeOrgMember,
  deleteTeam,
  deleteAllTeams,
  // SECRETS
  setSecret,
  setSecrets,
};
