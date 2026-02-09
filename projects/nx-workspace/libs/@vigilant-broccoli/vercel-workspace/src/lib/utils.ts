import { Vercel } from '@vercel/sdk';
import { VercelUser } from './types.js';
import { Team } from '@vercel/sdk/esm/models/team.js';

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_API_TOKEN,
});

export async function inviteVercelUser(user: Omit<VercelUser, 'uid'>) {
  try {
    await vercel.teams.inviteUserToTeam([
      {
        email: user.email,
        role: user.role,
      },
    ]);
    console.log(
      `✓ Successfully invited ${user.email} with role ${user.role}...`,
    );
  } catch (error) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = JSON.parse((error as any).body);
      const code = body?.error?.code;
      if (code === 'member_exists') {
        console.warn(`⚠️ ${user.email} is already a team member — skipping.`);
        return;
      }
    } catch {
      // If we can't parse the error, just continue to general error handling
    }
    console.error(
      `✗ Failed to invite ${user.email}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function fetchTeamMembers(teamId: string): Promise<VercelUser[]> {
  const url = `https://api.vercel.com/v3/teams/${teamId}/members`;
  const options = {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
    body: undefined,
  };

  const response = await fetch(url, options);
  const teamMembersResponseData = await response.json();
  return teamMembersResponseData.members as VercelUser[];
}

export async function removeTeamMembers(
  teamId: string,
  usersToRemove: VercelUser[],
): Promise<void> {
  for (const user of usersToRemove) {
    const url = `https://api.vercel.com/v1/teams/${teamId}/members/${user.uid}`;
    const options = {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
      body: undefined,
    };

    const response = await fetch(url, options);
    if (response.ok) {
      console.log(`✓ Successfully removed ${user.email}...`);
    } else {
      console.error(`✗ Failed to remove ${user.email}: ${response.statusText}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

export async function updateTeamMembers(
  teamId: string,
  usersToUpdate: VercelUser[],
  configuredUsers: Omit<VercelUser, 'uid'>[],
): Promise<void> {
  for (const user of usersToUpdate) {
    const url = `https://api.vercel.com/v1/teams/${teamId}/members/${user.uid}`;
    const foundUser = configuredUsers.find(
      configuredUser => configuredUser.email === user.email,
    );
    if (!foundUser) {
      console.error(`✗ Could not find configured user for ${user.email}`);
      continue;
    }
    const options = {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: foundUser.role }),
    };
    const response = await fetch(url, options);
    if (response.ok) {
      console.log(`✓ Successfully updated ${user.email}...`);
    } else {
      console.error(`✗ Failed to update ${user.email}: ${response.statusText}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

export async function inviteNewUsers(
  usersToInvite: Omit<VercelUser, 'uid'>[],
): Promise<void> {
  for (const user of usersToInvite) {
    await inviteVercelUser(user);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

export async function syncVercelUsers(
  configuredUsers: Omit<VercelUser, 'uid'>[],
) {
  const teamsResponse = await vercel.teams.getTeams({});
  if (!teamsResponse.teams || teamsResponse.teams.length === 0) {
    throw new Error('No teams found in Vercel account');
  }
  const team = teamsResponse.teams[0] as Team;
  const teamId = team.id;

  const teamMembers = await fetchTeamMembers(teamId);

  const usersToRemove = teamMembers.filter(
    user =>
      !configuredUsers.find(
        configuredUser => configuredUser.email === user.email,
      ),
  );
  const usersToUpdate = teamMembers.filter(user => {
    const foundUser = configuredUsers.find(
      configuredUser => configuredUser.email === user.email,
    );
    return foundUser && foundUser.role !== user.role;
  });
  const usersToInvite = configuredUsers.filter(
    configuredUser =>
      !teamMembers.find(member => member.email === configuredUser.email),
  );

  await removeTeamMembers(teamId, usersToRemove);
  await updateTeamMembers(teamId, usersToUpdate, configuredUsers);
  await inviteNewUsers(usersToInvite);
}
