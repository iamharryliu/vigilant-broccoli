import { ShellUtils } from '@vigilant-broccoli/common-node';
import { GithubTeam, GithubTeamMember, GithubTeamsDTO } from './github.types';
import { GithubCLICommand } from './github-commands';
import { toSlug } from './script';

export const GithubService = {
  getTeamsData: async (organizationName: string): Promise<GithubTeamsDTO[]> => {
    const teamsData = (await ShellUtils.runShellCommand(
      GithubCLICommand.getTeamsData(organizationName),
      true,
    )) as string;
    return JSON.parse(teamsData) as GithubTeamsDTO[];
  },
  getTeamMemberMembership: async (
    organizationName: string,
    teamSlug: string,
    memberUsername: string,
  ): Promise<GithubTeamMember> => {
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
  },
  getTeamAndDescendants: (
    all: GithubTeamsDTO[],
    slug: string,
  ): GithubTeamsDTO[] => {
    const team = all.find(team => team.slug === slug);
    const children = all.filter(
      team => team.parent && team.parent.slug === slug,
    );
    const descendants = children.flatMap(child =>
      GithubService.getTeamAndDescendants(all, child.slug),
    );
    return team ? [team, ...descendants] : descendants;
  },
  updateTeamRepositories: async (
    organizationName: string,
    team: GithubTeam,
  ) => {
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
  },
  updateTeamMembers: async (organizationName: string, team: GithubTeam) => {
    const teamSlug = toSlug(team.name);
    for (const member of team.members) {
      console.log(
        `Syncing member ${member.username} to team ${team.name} with role ${member.role}`,
      );
      await ShellUtils.runShellCommand(
        GithubCLICommand.updateTeamMember(organizationName, teamSlug, member),
      );
    }
  },
  removeMembersNotInConfig: async (
    organizationName: string,
    team: GithubTeam,
  ) => {
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
  },
  deleteAllTeams: async (organizationName: string) => {
    const teamsData = await GithubService.getTeamsData(organizationName);
    console.log('Deleting all teams for organization:', organizationName);
    for (const team of teamsData) {
      console.log(`Deleting team: ${team.name}`);
      try {
        await ShellUtils.runShellCommand(
          GithubCLICommand.deleteTeam(organizationName, team.slug),
        );
      } catch {}
    }
  },
};
