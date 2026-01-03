'use client';

import { Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const badges = await getBadges(repoUrl);
        setBadges(badges);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch GitHub Actions status');
        setLoading(false);
        console.error('GitHub Actions fetch error:', err);
      }
    }
    init();
  }, [repoUrl]);

  if (loading) {
    return <CardSkeleton title="GitHub Actions" rows={4} />;
  }

  if (error) {
    return (
      <CardContainer title="GitHub Actions">
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title="GitHub Actions"
      headerAction={
        <Link href={`${repoUrl}/actions`} target="_blank">
          <Text size="2" className="text-blue-600 hover:text-blue-800">
            View All →
          </Text>
        </Link>
      }
    >
      <Flex direction="column" gap="2">
          {badges.length > 0 ? (
            badges.map(badge => (
              <a
                key={badge.alt}
                href={badge.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img src={badge.src} alt={badge.alt} className="max-w-full h-auto" />
              </a>
            ))
          ) : (
            <Text className="text-gray-500">No workflows found</Text>
          )}
      </Flex>
    </CardContainer>
  );
};
