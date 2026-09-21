'use client';

import { Text } from './Text';
import { useEffect, useState } from 'react';

const WORKFLOWS_PER_PAGE = 100;
const FIRST_PAGE = 1;

type Workflow = {
  name: string;
  html_url: string;
  badge_url: string;
};

type WorkflowsPage = {
  total_count?: number;
  workflows?: Workflow[];
};

type Badge = {
  alt: string;
  href: string | null;
  src: string;
};

export const GithubActionsBadgeLink = ({ badge }: { badge: Badge }) => (
  <a
    href={badge.href || '#'}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block origin-left transition-transform duration-200 ease-out hover:scale-105 hover:-translate-y-0.5 hover:drop-shadow-md"
  >
    <img src={badge.src} alt={badge.alt} className="max-w-full h-auto" />
  </a>
);

function toActionsWorkflowUrl(htmlUrl: string): string | null {
  const url = new URL(htmlUrl);
  if (url.hostname !== 'github.com') return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 3) return null;
  const [, , keyword] = parts;
  // Dynamic workflows (Dependabot, CodeQL default setup) already have an
  // `/actions/workflows/...` html_url with no `.github/workflows` blob to parse.
  if (keyword === 'actions') return htmlUrl;
  if (keyword !== 'blob' || parts.length < 7) return null;
  const [owner, repo, , , ...rest] = parts;
  const dotgithubIdx = rest.indexOf('.github');
  if (dotgithubIdx === -1 || rest[dotgithubIdx + 1] !== 'workflows')
    return null;
  const filePath = rest.slice(dotgithubIdx + 2).join('/');
  return `https://github.com/${owner}/${repo}/actions/workflows/${filePath}`;
}

function mapRepoUrlToWorkflowsApi(url: string): string {
  const parsed = new URL(url);
  const [owner, repo] = parsed.pathname.split('/').filter(Boolean);
  return `https://api.github.com/repos/${owner}/${repo}/actions/workflows`;
}

async function getWorkflowsPage(
  apiUrl: string,
  page: number,
): Promise<WorkflowsPage> {
  const res = await fetch(
    `${apiUrl}?per_page=${WORKFLOWS_PER_PAGE}&page=${page}`,
  );
  return res.json();
}

async function getBadges(repoUrl: string): Promise<Badge[]> {
  const apiUrl = mapRepoUrlToWorkflowsApi(repoUrl);
  const firstPage = await getWorkflowsPage(apiUrl, FIRST_PAGE);
  const remainingPageCount = Math.max(
    Math.ceil((firstPage.total_count ?? 0) / WORKFLOWS_PER_PAGE) - 1,
    0,
  );
  const remainingPages = await Promise.all(
    Array.from({ length: remainingPageCount }, (_, i) =>
      getWorkflowsPage(apiUrl, FIRST_PAGE + i + 1),
    ),
  );
  return [firstPage, ...remainingPages]
    .flatMap(data => data.workflows ?? [])
    .map(wf => ({
      alt: wf.name,
      href: toActionsWorkflowUrl(wf.html_url),
      src: wf.badge_url,
    }))
    .sort((a, b) => a.alt.localeCompare(b.alt));
}

export const GithubActionsBadges = ({
  repoUrl,
  onLoadingChange,
}: {
  repoUrl: string;
  onLoadingChange?: (loading: boolean) => void;
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onLoadingChange?.(true);
    getBadges(repoUrl)
      .then(setBadges)
      .finally(() => {
        setLoading(false);
        onLoadingChange?.(false);
      });
  }, [repoUrl, onLoadingChange]);

  if (loading) return null;

  if (badges.length === 0) {
    return <Text className="text-gray-500">No workflows found</Text>;
  }

  return (
    <>
      {badges.map(badge => (
        <GithubActionsBadgeLink key={badge.alt} badge={badge} />
      ))}
    </>
  );
};
