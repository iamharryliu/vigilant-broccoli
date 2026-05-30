'use client';

import { Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

type Badge = {
  alt: string;
  href: string;
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

function toActionsWorkflowUrl(blobUrl: string): string | null {
  const url = new URL(blobUrl);
  if (url.hostname !== 'github.com') return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 7) return null;
  const [owner, repo, blobKeyword, _branch, ...rest] = parts;
  if (blobKeyword !== 'blob') return null;
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

async function getBadges(repoUrl: string): Promise<Badge[]> {
  const res = await fetch(mapRepoUrlToWorkflowsApi(repoUrl));
  const data = await res.json();
  return data.workflows
    .map((wf: any) => ({
      alt: wf.name,
      href: toActionsWorkflowUrl(wf.html_url),
      src: wf.badge_url,
    }))
    .sort((a: Badge, b: Badge) => a.alt.localeCompare(b.alt));
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
