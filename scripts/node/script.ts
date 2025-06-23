import { FileSystemUtils, ShellUtils } from '@vigilant-broccoli/common-node';
import {
  GithubOrganizationTeamStructure,
  GithubTeam,
  GithubTeamMember,
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

async function configureGithubTeams(
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

async function getTeamMembers(
  org: string,
  slug: string,
): Promise<GithubTeamMember[]> {
  const data = await ShellUtils.runShellCommand(
    `gh api orgs/${org}/teams/${slug}/members`,
    true,
  );
  const members = JSON.parse(data as string) as any[];

  return await Promise.all(
    members.map(async (m: any) => {
      return await GithubService.getTeamMemberMembership(org, slug, m.login);
    }),
  );
}

async function buildTeamTree(
  org: string,
  teams: GithubTeamsDTO[],
): Promise<GithubTeam[]> {
  const slugToTeam: Record<string, GithubTeam> = {};

  // Initialize all teams
  for (const team of teams) {
    slugToTeam[toSlug(team.name)] = {
      name: team.name,
      members: await getTeamMembers(org, toSlug(team.name)),
      teams: [],
      repositories: [],
    };
  }

  // Link children to parents
  const roots: GithubTeam[] = [];
  for (const team of teams) {
    if (team.parent?.slug) {
      slugToTeam[team.parent.slug].teams.push(slugToTeam[team.slug]);
    } else {
      roots.push(slugToTeam[team.slug]);
    }
  }

  return roots;
}

async function buildOrgStructure(org: string) {
  const allTeams = await GithubService.getTeamsData(org);
  const tree = await buildTeamTree(org, allTeams);

  return {
    organizationName: org,
    teams: tree,
  };
}

(async () => {
  const ORGANIZATION_NAME = 'prettydamntired';

  const organizationData = FileSystemUtils.getObjectFromFilepath(
    // TODO: change this
    './test-teams.json',
  ) as GithubOrganizationTeamStructure;
  configureGithubTeams(organizationData);
  const structure = await buildOrgStructure(ORGANIZATION_NAME);
  if (JSON.stringify(structure) === JSON.stringify(organizationData)) {
    console.log('Organization structure matches the configuration.');
  }
  await GithubService.deleteAllTeams(ORGANIZATION_NAME);
})();
