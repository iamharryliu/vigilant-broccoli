'use client';

import { Card, Heading } from '@radix-ui/themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Badge = {
  alt: string;
  href: string;
  src: string;
};

function toActionsWorkflowUrl(blobUrl: string): string | null {
  const url = new URL(blobUrl);

  // We expect host = github.com
  if (url.hostname !== 'github.com') return null;

  // Path is like /owner/repo/blob/main/.github/workflows/filename.yml
  const parts = url.pathname.split('/').filter(Boolean);
  // e.g. ["owner", "repo", "blob", "main", ".github", "workflows", "deploy-cms-flask.yml"]
  if (parts.length < 7) return null;

  const [owner, repo, blobKeyword, branch, dotgithub, workflowsDir, ...rest] =
    parts;
  if (blobKeyword !== 'blob') return null;
  if (dotgithub !== '.github' || workflowsDir !== 'workflows') return null;

  const filePath = rest.join('/'); // e.g. "deploy-cms-flask.yml"

  // Construct the new URL
  return `https://github.com/${owner}/${repo}/actions/workflows/${filePath}`;
}
function mapRepoUrlToWorkflowsApi(url: string): string {
  const parsed = new URL(url);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const [owner, repo] = parts;
  console.log(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`)
  return `https://api.github.com/repos/${owner}/${repo}/actions/workflows`;
}

async function getBadges(repoUrl: string) {
  const res = await fetch(mapRepoUrlToWorkflowsApi(repoUrl));
  const data = await res.json();

  const badges: Badge[] = data.workflows.map((wf: any) => ({
    alt: wf.name,
    href: toActionsWorkflowUrl(wf.html_url),
    src: wf.badge_url,
  }));

  return badges;
}

export const GithubRepoActionStatusBadges = ({
  repoUrl,
}: {
  repoUrl: string;
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    async function init() {
      const badges = await getBadges(repoUrl);
      setBadges(badges);
    }
    init();
  }, []);

  return (
    <Card>
      <Heading>Github Actions</Heading>
      <Link href={`${repoUrl}/actions`} target="_blank">
        Go To Actions
      </Link>
      {badges.map(badge => (
        <div key={badge.alt} className="mb-1">
          <a href={badge.href} target="_blank" rel="noopener noreferrer">
            <img src={badge.src} alt={badge.alt} />
          </a>
        </div>
      ))}
    </Card>
  );
};
