import { toSlug } from '@vigilant-broccoli/common-js';
import { ShellUtils } from '../shell/shell.utils';
import { GithubService } from './github.service';
import {
  GithubTeamMember,
  GithubTeamsDTO,
  GithubTeam,
  GithubTeamRepository,
} from './github.types';

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

async function getTeamRepositories(
  org: string,
  slug: string,
): Promise<GithubTeamRepository[]> {
  const data = await ShellUtils.runShellCommand(
    `gh api orgs/${org}/teams/${slug}/repos`,
    true,
  );

  const repos = JSON.parse(data as string) as any[];

  return await Promise.all(
    repos.map(repo => {
      return { name: repo.name, permission: repo.permissions };
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
      repositories: await getTeamRepositories(org, toSlug(team.name)),
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
