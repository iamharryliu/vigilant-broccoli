const GITHUB_BASE = 'https://github.com';

export const GITHUB_ORG_URLS = {
  repositories: (org: string) => `${GITHUB_BASE}/orgs/${org}/repositories`,
  people: (org: string) => `${GITHUB_BASE}/orgs/${org}/people`,
  teams: (org: string) => `${GITHUB_BASE}/orgs/${org}/teams`,
  team: (org: string, team: string) =>
    `${GITHUB_BASE}/orgs/${org}/teams/${team}`,
  member: (login: string) => `${GITHUB_BASE}/${login}`,
  memberRepos: (login: string) => `${GITHUB_BASE}/${login}?tab=repositories`,
};
