import { ShellUtils } from '../shell/shell.utils';
import { GithubTeam, GithubTeamMember, GithubTeamsDTO } from './github.types';
import { GithubCLICommand } from './github-commands';
import { GithubUtils } from './github.utils';
import {
  GithubOrganizationTeamStructure,
  toSlug,
} from '@vigilant-broccoli/common-js';

async function getOwnedOrganizations(): Promise<string[]> {
  const res = await ShellUtils.runShellCommand(
    `gh api user/memberships/orgs --paginate --jq '.[] | select(.role=="admin") | .organization.login'`,
    true,
  );

  if (!res) {
    return [];
  }

  return (res as string)
    .split('\n')
    .map(org => org.trim())
    .filter(Boolean);
}

async function getOrgStructure(
  org: string,
): Promise<GithubOrganizationTeamStructure> {
  const allTeams = await GithubService.getTeamsData(org);
  const tree = await GithubUtils.buildTeamTree(org, allTeams);

  return {
    organizationName: org,
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
  const existingMembers = JSON.parse(data).map((member: any) => member.login);
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

export const GithubService = {
  // READ
  getOwnedOrganizations,
  getOrgStructure,
  getTeamsData,
  getTeamMembers,
  getTeamMemberMembership,
  getTeamAndDescendants,
  // UPDATE
  updateTeamRepositories,
  updateTeamMembers,
  // DELETE
  removeMembersNotInConfig,
  deleteAllTeams,
};
