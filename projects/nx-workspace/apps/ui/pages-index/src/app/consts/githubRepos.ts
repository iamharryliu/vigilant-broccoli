export const GITHUB_OWNER = 'iamharryliu';

export interface GithubRepoInfo {
  slug: string;
  readmePath: string;
}

export const GITHUB_REPOS: GithubRepoInfo[] = [
  {
    slug: 'vigilant-broccoli',
    readmePath: 'README.md',
  },
];

export const GITHUB_REPOSITORIES_URL = `https://github.com/${GITHUB_OWNER}?tab=repositories`;

export const toGithubRepoUrl = (slug: string) =>
  `https://github.com/${GITHUB_OWNER}/${slug}`;

export const findGithubRepo = (slug?: string) =>
  GITHUB_REPOS.find(repo => repo.slug === slug);
