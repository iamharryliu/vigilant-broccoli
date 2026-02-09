/* eslint-disable no-console */
import { ShellUtils } from '../shell/shell.utils';
import { GithubService } from './github.service';
import {
  toSlug,
  GithubTeamMember,
  GithubTeamsDTO,
  GithubTeam,
  GithubTeamRepository,
} from '@vigilant-broccoli/common-js';
import { GithubUser } from './github.models';
import { GithubUserRole } from './github.consts';

async function getTeamMembers(
  org: string,
  slug: string,
): Promise<GithubTeamMember[]> {
  const data = await ShellUtils.runShellCommand(
    `gh api orgs/${org}/teams/${slug}/members`,
    true,
  );
  const members = JSON.parse(data as string) as {
    login: string;
    avatar_url: string;
  }[];

  return await Promise.all(
    members.map(async m => {
      const membership = await GithubService.getTeamMemberMembership(
        org,
        slug,
        m.login,
      );
      return {
        ...membership,
        avatar_url: m.avatar_url,
      };
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

  const teamPromises = teams.map(async team => {
    const slug = toSlug(team.name);

    const [members, repositories] = await Promise.all([
      getTeamMembers(org, slug),
      getTeamRepositories(org, slug),
    ]);

    return {
      slug,
      data: {
        name: team.name,
        members,
        teams: [],
        repositories,
      },
    };
  });

  const results = await Promise.all(teamPromises);

  for (const { slug, data } of results) {
    slugToTeam[slug] = data;
  }

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

async function fetchOrgMembers(
  org: string,
  token: string,
): Promise<GithubUser[]> {
  const url = `https://api.github.com/orgs/${org}/members`;
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  };

  console.log(`🔍 Fetching members from: ${url}`);
  const response = await fetch(url, options);

  console.log(`📡 Response status: ${response.status} ${response.statusText}`);

  const members = (await response.json()) as GithubUser[];
  console.log(`✓ Fetched ${members.length} members\n`);

  return members;
}

async function addOrgMember(
  org: string,
  username: string,
  role: GithubUserRole,
  token: string,
): Promise<void> {
  const url = `https://api.github.com/orgs/${org}/memberships/${username}`;
  const options = {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  };

  const response = await fetch(url, options);
  if (response.ok) {
    console.log(`✓ Successfully added ${username} with role ${role}...`);
  } else {
    const errorData = await response.json();
    console.error(
      `✗ Failed to add ${username}: ${response.statusText}`,
      errorData,
    );
  }
  console.log(`[DRY RUN] Would add ${username} with role ${role}`);
}

async function removeOrgMember(
  org: string,
  username: string,
  token: string,
): Promise<void> {
  const url = `https://api.github.com/orgs/${org}/members/${username}`;
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  };

  const response = await fetch(url, options);
  if (response.ok || response.status === 204) {
    console.log(`✓ Successfully removed ${username}...`);
  } else {
    console.error(`✗ Failed to remove ${username}: ${response.statusText}`);
  }
  console.log(`[DRY RUN] Would remove ${username}`);
}

async function syncGithubOrganizationMembers({
  organizationName,
  githubUsers,
  token,
}: {
  organizationName: string;
  githubUsers: { login: string; role: GithubUserRole }[];
  token: string;
}) {
  console.log(`\n🔄 Starting sync for GitHub org: ${organizationName}\n`);

  const currentMembers = await fetchOrgMembers(organizationName, token);
  console.log(`📊 Current org members: ${currentMembers.length}`);
  console.log(`📋 Configured users: ${githubUsers.length}\n`);

  const usersToRemove = currentMembers.filter(
    member =>
      !githubUsers.find(
        configuredUser => configuredUser.login === member.login,
      ),
  );

  const usersToAdd = githubUsers.filter(
    configuredUser =>
      !currentMembers.find(member => member.login === configuredUser.login),
  );

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 SYNC SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (usersToRemove.length > 0) {
    console.log(`🗑️  Users to REMOVE (${usersToRemove.length}):`);
    usersToRemove.forEach(user => {
      console.log(`   ❌ ${user.login} (ID: ${user.id})`);
    });
    console.log('');
  } else {
    console.log('✓ No users to remove\n');
  }

  if (usersToAdd.length > 0) {
    console.log(`➕ Users to ADD (${usersToAdd.length}):`);
    usersToAdd.forEach(user => {
      console.log(`   ✨ ${user.login} (role: ${user.role})`);
    });
    console.log('');
  } else {
    console.log('✓ No users to add\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');

  if (usersToRemove.length > 0) {
    console.log('🗑️  Processing removals...\n');
    for (const user of usersToRemove) {
      await removeOrgMember(organizationName, user.login, token);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('');
  }

  if (usersToAdd.length > 0) {
    console.log('➕ Processing additions...\n');
    for (const user of usersToAdd) {
      await addOrgMember(organizationName, user.login, user.role, token);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Sync completed!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

export const GithubUtils = {
  buildTeamTree,
  syncGithubOrganizationMembers,
};
