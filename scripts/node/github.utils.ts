import { ShellUtils } from '@vigilant-broccoli/common-node';
import { GithubService } from './github.service';
import { GithubTeamMember, GithubTeamsDTO, GithubTeam } from './github.types';
import { toSlug } from './script';

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

export const GithubUtils = {
  buildTeamTree,
};
