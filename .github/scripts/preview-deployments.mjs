import { existsSync, readFileSync } from 'node:fs';

const env = name => process.env[name] ?? '';

const DEPLOY_LOG_PATH = 'projects/nx-workspace/deploy.log';
const PREVIEW_URL_PATTERN =
  /https:\/\/[a-z0-9-]+\.preview-[a-z0-9-]+\.pages\.dev/g;
const PREVIEW_PROJECT_PREFIX = 'preview-';
const NO_CONTENT = 204;
const GITHUB_API = env('GITHUB_API_URL') || 'https://api.github.com';

export const PREVIEW_ENVIRONMENT_PATTERN = /^pr-(\d+)\/[a-z0-9-]+$/;

export const previewEnvironment = (prNumber, app) => `pr-${prNumber}/${app}`;

export const appFromProject = project =>
  project.startsWith(PREVIEW_PROJECT_PREFIX)
    ? project.slice(PREVIEW_PROJECT_PREFIX.length)
    : project;

// Wrangler prints the immutable deployment URL and the pr-<n> alias for each
// project it deployed; a project absent from deploy.log did not deploy.
// Returns Map<project, { latest?, build? }>.
export const parseDeployedSites = previewBranch => {
  const log = existsSync(DEPLOY_LOG_PATH)
    ? readFileSync(DEPLOY_LOG_PATH, 'utf8')
    : '';
  const urls = [...new Set(log.match(PREVIEW_URL_PATTERN) ?? [])];
  const sites = new Map();
  for (const url of urls) {
    const [deployment, site] = new URL(url).hostname.split('.');
    const links = sites.get(site) ?? {};
    links[deployment === previewBranch ? 'latest' : 'build'] = url;
    sites.set(site, links);
  }
  return sites;
};

export const githubApi = async (path, { method = 'GET', body } = {}) => {
  const response = await fetch(`${GITHUB_API}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env('GITHUB_TOKEN')}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok)
    throw new Error(
      `${method} ${path} failed: ${response.status} ${await response.text()}`,
    );
  // DELETE answers 204 with no body.
  return response.status === NO_CONTENT ? null : response.json();
};

const PAGE_SIZE = 100;

export const githubApiPaginated = async path => {
  const separator = path.includes('?') ? '&' : '?';
  const items = [];
  for (let page = 1; ; page++) {
    const batch = await githubApi(
      `${path}${separator}per_page=${PAGE_SIZE}&page=${page}`,
    );
    items.push(...batch);
    if (batch.length < PAGE_SIZE) return items;
  }
};
