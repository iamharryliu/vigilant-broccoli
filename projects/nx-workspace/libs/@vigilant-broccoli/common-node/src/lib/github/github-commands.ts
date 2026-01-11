import { GithubTeamMember } from '@vigilant-broccoli/common-js';

export const GithubCLICommand = {
  createTeam: (
    organizationName: string,
    teamSlug: string,
    parentTeamId?: number,
  ) =>
    `gh api -X POST /orgs/${organizationName}/teams -f name="${teamSlug}" -f privacy=closed ${
      parentTeamId ? `-F parent_team_id=${parentTeamId}` : ''
    } > /dev/null`,
  getTeamsData: (organizationName: string, teamSlug?: string) =>
    `gh api orgs/"${organizationName}"/teams${
      teamSlug ? `/${teamSlug}` : ''
    } --paginate`,
  getTeamMembers: (organizationName: string, teamSlug: string) =>
    `gh api orgs/"${organizationName}"/teams/${teamSlug}/members --paginate`,
  getTeamMemberMembership: (
    organizationName: string,
    teamSlug: string,
    member: string,
  ) =>
    `gh api orgs/"${organizationName}"/teams/${teamSlug}/memberships/${member}`,
  updateTeamMember: (
    organizationName: string,
    teamSlug: string,
    member: GithubTeamMember,
  ) =>
    `gh api -X PUT /orgs/${organizationName}/teams/${teamSlug}/memberships/${member.username} -f role=${member.role} > /dev/null`,
  removeTeamMember: (
    organizationName: string,
    teamSlug: string,
    member: string,
  ) =>
    `gh api -X DELETE /orgs/${organizationName}/teams/${teamSlug}/memberships/${member} > /dev/null`,
  updateTeamRepo: (
    organizationName: string,
    teamSlug: string,
    repoName: string,
    permission: string,
  ) =>
    `gh api -X PUT /orgs/${organizationName}/teams/${teamSlug}/repos/${organizationName}/${repoName} -f permission=${permission} > /dev/null`,
  deleteTeam: (organizationName: string, teamSlug: string) =>
    `gh api -X DELETE /orgs/${organizationName}/teams/${teamSlug}`,
  getOrgMembers: (organizationName: string) =>
    `gh api orgs/${organizationName}/members --paginate`,
  getOrgData: (organizationName: string) =>
    `gh api orgs/${organizationName}`,
  getOrgRepositories: (organizationName: string) =>
    `gh api orgs/${organizationName}/repos --paginate`,
  addOrgMember: (organizationName: string, username: string) =>
    `gh api -X PUT /orgs/${organizationName}/memberships/${username} -f role=member > /dev/null`,
  removeOrgMember: (organizationName: string, username: string) =>
    `gh api -X DELETE /orgs/${organizationName}/members/${username} > /dev/null`,
};
