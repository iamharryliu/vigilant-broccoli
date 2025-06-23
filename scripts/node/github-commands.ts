import { GithubTeamMember } from './github.types';

export const GithubCLICommand = {
  createTeam: (
    organizationName: string,
    teamSlug: string,
    parentTeamId?: number,
  ) =>
    `gh api -X POST /orgs/${organizationName}/teams -f name="${teamSlug}" -f privacy=closed ${parentTeamId ? `-F parent_team_id=${parentTeamId}` : ''} > /dev/null`,
  getTeamsData: (organizationName: string, teamSlug?: string) =>
    `gh api orgs/"${organizationName}"/teams${teamSlug ? `/${teamSlug}` : ''} --paginate`,
  updateTeamMember: (
    organizationName: string,
    teamSlug: string,
    member: GithubTeamMember,
  ) =>
    `gh api -X PUT /orgs/${organizationName}/teams/${teamSlug}/memberships/${member.username} -f role=${member.role} > /dev/null`,
  updateTeamRepo: (
    organizationName: string,
    teamSlug: string,
    repoName: string,
    permission: string,
  ) =>
    `gh api -X PUT /orgs/${organizationName}/teams/${teamSlug}/repos/${organizationName}/${repoName} -f permission=${permission} > /dev/null`,
    deleteTeam: (
    organizationName: string,
    teamSlug: string,
  ) =>
    `gh api -X DELETE /orgs/${organizationName}/teams/${teamSlug}`,
};
