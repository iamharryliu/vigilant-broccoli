export const GITHUB_OWNER = 'iamharryliu';
const GITHUB_API_URL = `https://api.github.com`;
const REPOS_PER_PAGE = 100;

export interface GithubRepoInfo {
  name: string;
  description: string | null;
}

export const toGithubRepoUrl = (slug: string) =>
  `https://github.com/${GITHUB_OWNER}/${encodeURIComponent(slug)}`;

export const toGithubReadmeUrl = (slug: string) =>
  `${GITHUB_API_URL}/repos/${GITHUB_OWNER}/${encodeURIComponent(slug)}/readme`;

export const fetchGithubRepos = async (signal: AbortSignal) => {
  const repos: GithubRepoInfo[] = [];
  let page = 1;
  while (true) {
    const response = await fetch(
      `${GITHUB_API_URL}/users/${GITHUB_OWNER}/repos?type=owner&sort=full_name&per_page=${REPOS_PER_PAGE}&page=${page}`,
      { signal },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const batch: GithubRepoInfo[] = await response.json();
    repos.push(...batch);
    if (batch.length < REPOS_PER_PAGE) return repos;
    page += 1;
  }
};
