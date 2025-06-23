import { ShellUtils } from '@vigilant-broccoli/common-node';
import {
  GithubOrganizationTeamStructure,
  GithubTeam,
  GithubTeamsDTO,
} from './github.types';
import { GithubCLICommand } from './github-commands';
import { GithubService } from './github.service';

export function toSlug(input: string): string {
  return input.toLowerCase().replace(/ /g, '-');
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

function getTeamId(
  teamSlug: string,
  githubTeamsJson: GithubTeamsDTO[],
): number | undefined {
  const team = githubTeamsJson.find(t => t.slug === teamSlug)!;
  return team?.id;
}

export async function configureGithubTeams(
  organizationData: GithubOrganizationTeamStructure,
) {
  const { organizationName, teams: teamsConfig } = organizationData;

  let githubOrganizationTeams =
    await GithubService.getTeamsData(organizationName);

  async function syncTeam(team: GithubTeam, parentTeamId?: number) {
    const teamSlug = toSlug(team.name);
    let existingTeamId = getTeamId(teamSlug, githubOrganizationTeams);
    if (!existingTeamId) {
      console.log(`Creating team: ${team.name}`);
      await ShellUtils.runShellCommand(
        GithubCLICommand.createTeam(organizationName, teamSlug, parentTeamId),
      );
      githubOrganizationTeams =
        await GithubService.getTeamsData(organizationName);
      existingTeamId = getTeamId(teamSlug, githubOrganizationTeams);
    }

    await GithubService.removeMembersNotInConfig(organizationName, team);
    await GithubService.updateTeamMembers(organizationName, team);
    await GithubService.updateTeamRepositories(organizationName, team);

    for (const subTeam of team.teams) {
      await syncTeam(subTeam, existingTeamId);
    }
  }

  for (const team of teamsConfig) {
    await syncTeam(team, undefined);
  }

  for (const team of organizationData.teams) {
    const teamAndDescendants = GithubService.getTeamAndDescendants(
      githubOrganizationTeams,
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
}
