import { GithubTeamMember } from '@vigilant-broccoli/github-workspace-js';

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
  getUserData: (username: string) =>
    `gh api users/${username} --jq '.public_repos'`,
  getOrgMembers: (organizationName: string) =>
    `gh api orgs/${organizationName}/members --paginate`,
  getOrgAdmins: (organizationName: string) =>
    `gh api orgs/${organizationName}/members?role=admin --paginate`,
  getOrgData: (organizationName: string) => `gh api orgs/${organizationName}`,
  getOrgMembershipRole: (organizationName: string) =>
    `gh api user/memberships/orgs/${organizationName} --jq '.role'`,
  getOrgRepositories: (organizationName: string) =>
    `gh api orgs/${organizationName}/repos --paginate`,
  createOrgRepo: (organizationName: string, repoName: string) =>
    `gh api -X POST /orgs/${organizationName}/repos -f name="${repoName}" -f private=true > /dev/null`,
  deleteOrgRepo: (organizationName: string, repoName: string) =>
    `gh api -X DELETE /repos/${organizationName}/${repoName}`,
  addOrgMember: (organizationName: string, username: string) =>
    `gh api -X PUT /orgs/${organizationName}/memberships/${username} -f role=member > /dev/null`,
  removeOrgMember: (organizationName: string, username: string) =>
    `gh api -X DELETE /orgs/${organizationName}/members/${username} > /dev/null`,
  listPagesRepos: () =>
    `gh api user/repos --paginate --jq '.[] | select(.has_pages == true) | {full_name, html_url}'`,
  getRepoPages: (fullName: string) => `gh api repos/${fullName}/pages`,
};
