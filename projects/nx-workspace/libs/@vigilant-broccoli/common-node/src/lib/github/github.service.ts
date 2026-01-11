import { ShellUtils } from '../shell/shell.utils';
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
  toSlug,
} from '@vigilant-broccoli/common-js';

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

async function getOrgMembers(org: string): Promise<GithubOrgMember[]> {
  const membersData = (await ShellUtils.runShellCommand(
    GithubCLICommand.getOrgMembers(org),
    true,
  )) as string;
  const members = JSON.parse(membersData);
  return Array.isArray(members) ? members : [];
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
  return { username: memberUsername, role: membershipData.role };
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
  const existingMembers = JSON.parse(data).map((member: { login: string }) => member.login);
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

export const GithubService = {
  // READ
  getOwnedOrganizations,
  getOrgStructure,
  getOrgData,
  getTeamsData,
  getTeamMembers,
  getOrgMembers,
  getOrgMembersCount,
  getOrgRepositories,
  getTeamMemberMembership,
  getTeamAndDescendants,
  // UPDATE
  updateTeamRepositories,
  updateTeamMembers,
  addOrgMember,
  // DELETE
  removeMembersNotInConfig,
  removeOrgMember,
  deleteAllTeams,
};
