import { FileSystemUtils, ShellUtils } from '@vigilant-broccoli/common-node';
import {
  GithubOrganizationTeamStructure,
  GithubTeam,
  GithubTeamsDTO,
} from './github.types';
import { GithubCLICommand } from './github-commands';

function toSlug(input: string): string {
  return input.toLowerCase().replace(/ /g, '-');
}

const StringUtils = {
  toSlug,
};

function getTeamAndDescendants(
  all: GithubTeamsDTO[],
  slug: string,
): GithubTeamsDTO[] {
  const team = all.find(team => team.slug === slug);
  const children = all.filter(team => team.parent && team.parent.slug === slug);
  const descendants = children.flatMap(child =>
    getTeamAndDescendants(all, child.slug),
  );
  return team ? [team, ...descendants] : descendants;
}

function findTeamBySlug(
  org: GithubOrganizationTeamStructure,
  slug: string,
): GithubTeam | null {
  // Converts team name to slug (lowercase and kebab-case)
  // Recursively searches for the team in nested structure
  const search = (teams: GithubTeam[]): GithubTeam | null => {
    for (const team of teams) {
      if (toSlug(team.name) === slug) {
        return team;
      }
      const found = search(team.teams);
      if (found) return found;
    }
    return null;
  };

  return search(org.teams);
}

const GithubService = {
  getTeamsData: async (organizationName: string): Promise<GithubTeamsDTO[]> => {
    const teamsData = (await ShellUtils.runShellCommand(
      GithubCLICommand.getTeamsData(organizationName),
      true,
    )) as string;
    return JSON.parse(teamsData) as GithubTeamsDTO[];
  },
};

(async () => {
  function getTeamId(
    slug: string,
    githubTeamsJson: GithubTeamsDTO[],
  ): number | undefined {
    const team = githubTeamsJson.find(t => t.slug === slug)!;
    return team?.id;
  }

  const organizationData = FileSystemUtils.getObjectFromFilepath(
    // TODO: change this
    './test-teams.json',
  ) as GithubOrganizationTeamStructure;
  const { organizationName, teams: organizationTeamsJson } = organizationData;

  let gitHubOrganizationTeams =
    await GithubService.getTeamsData(organizationName);

  async function syncTeam(team: GithubTeam, parentTeamId?: number) {
    const teamSlug = StringUtils.toSlug(team.name);
    let existingTeamId = getTeamId(teamSlug, gitHubOrganizationTeams);
    console.log(teamSlug);
    if (!existingTeamId) {
      console.log(`Creating team: ${team.name}`);
      await ShellUtils.runShellCommand(
        GithubCLICommand.createTeam(organizationName, teamSlug, parentTeamId),
      );
      gitHubOrganizationTeams =
        await GithubService.getTeamsData(organizationName);
      existingTeamId = getTeamId(teamSlug, gitHubOrganizationTeams);
    } else {
      console.log(`Team already exists: ${team.name}`);
    }

    for (const member of team.members) {
      console.log(
        `Syncing member ${member.username} to team ${team.name} with role ${member.role}`,
      );
      await ShellUtils.runShellCommand(
        GithubCLICommand.updateTeamMember(organizationName, teamSlug, member),
      );
    }
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

    for (const subTeam of team.teams) {
      await syncTeam(subTeam, existingTeamId);
    }
  }

  for (const team of organizationTeamsJson) {
    await syncTeam(team, undefined);
  }

  for (const team of organizationData.teams) {
    const teamAndDescendants = getTeamAndDescendants(
      gitHubOrganizationTeams,
      toSlug(team.name),
    );
    const existingTeamNames = teamAndDescendants.map(t => t.name);
    for (const t of existingTeamNames) {
      if (!findTeamBySlug(organizationData, toSlug(t))) {
        console.log(`Deleting team: ${t}`);
        await ShellUtils.runShellCommand(
          GithubCLICommand.deleteTeam(organizationName, toSlug(t)),
        );
      }
    }
  }
})();
