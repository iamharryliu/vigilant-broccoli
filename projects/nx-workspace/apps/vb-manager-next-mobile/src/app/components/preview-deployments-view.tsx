'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  Button,
  Callout,
  CalloutText,
  Card,
  Text,
} from '@vigilant-broccoli/react-lib';
import {
  PREVIEW_DEPLOYMENTS_API_PATH,
  PREVIEW_DEPLOYMENTS_ERROR,
  PreviewDeploymentPullRequest,
  PreviewDeploymentsResult,
} from '@vigilant-broccoli/github-workspace-js';
import { authFetch } from '../providers/auth-provider';

const LABEL = {
  REFRESH: 'Refresh',
  ALIAS: 'Latest',
  BUILD: 'This build',
  UPDATED: 'Updated',
  BY: 'by',
};

const MESSAGE = {
  LOADING: 'Loading preview deployments…',
  EMPTY: 'No open pull requests have a deployed preview.',
  UPSTREAM: 'Could not load preview deployments from GitHub.',
  RATE_LIMITED:
    'GitHub API rate limit reached (60 unauthenticated requests per hour). Set GITHUB_TOKEN on the server to lift it.',
  RATE_LIMIT_RESET: 'Try again after',
};

const LINK_CLASS = 'text-blue-600 hover:underline dark:text-blue-400';
// Apple's minimum touch target.
const TAP_TARGET_CLASS = 'inline-flex min-h-[44px] items-center';

const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' };

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

const fetchPreviewDeployments = async (): Promise<PreviewDeploymentsResult> => {
  try {
    const response = await authFetch(PREVIEW_DEPLOYMENTS_API_PATH);
    return await response.json();
  } catch {
    return {
      ok: false,
      error: PREVIEW_DEPLOYMENTS_ERROR.UPSTREAM,
      rateLimitResetAt: null,
    };
  }
};

const errorMessage = (
  result: Extract<PreviewDeploymentsResult, { ok: false }>,
) =>
  result.error === PREVIEW_DEPLOYMENTS_ERROR.RATE_LIMITED
    ? `${MESSAGE.RATE_LIMITED}${result.rateLimitResetAt ? ` ${MESSAGE.RATE_LIMIT_RESET} ${formatTime(result.rateLimitResetAt)}.` : ''}`
    : MESSAGE.UPSTREAM;

const PullRequestCard = ({ pull }: { pull: PreviewDeploymentPullRequest }) => (
  <Card className="flex flex-col gap-2 p-4">
    <a href={pull.url} {...externalLinkProps} className={LINK_CLASS}>
      <Text weight="bold">
        #{pull.number} {pull.title}
      </Text>
    </a>
    <Text size="2" color="gray" className="break-all">
      {pull.author && `${LABEL.BY} ${pull.author} · `}
      <code>{pull.headRef}</code>
    </Text>
    <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
      {pull.apps.map(app => (
        <li key={app.app} className="flex items-center gap-4">
          <Text size="2" weight="medium" className="flex-1 truncate">
            {app.app}
          </Text>
          <a
            href={app.aliasUrl}
            {...externalLinkProps}
            className={`${LINK_CLASS} ${TAP_TARGET_CLASS}`}
          >
            <Text size="2">{LABEL.ALIAS}</Text>
          </a>
          <a
            href={app.buildUrl}
            {...externalLinkProps}
            className={`${LINK_CLASS} ${TAP_TARGET_CLASS}`}
          >
            <Text size="2">{LABEL.BUILD}</Text>
          </a>
        </li>
      ))}
    </ul>
  </Card>
);

export const PreviewDeploymentsView = () => {
  const [result, setResult] = useState<PreviewDeploymentsResult | null>(null);
  const [loading, setLoading] = useState(true);

  // On load and on demand only: unauthenticated GitHub calls are limited to
  // 60 per hour per IP, so no polling.
  const refresh = useCallback(async () => {
    setLoading(true);
    setResult(await fetchPreviewDeployments());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-4">
      <div className="flex items-center justify-end gap-3">
        {result?.ok && (
          <Text size="1" color="gray">
            {LABEL.UPDATED} {formatTime(result.fetchedAt)}
          </Text>
        )}
        <Button variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw size={16} />
          {LABEL.REFRESH}
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {loading && !result ? (
          <Text color="gray">{MESSAGE.LOADING}</Text>
        ) : result && !result.ok ? (
          <Callout color="red">
            <CalloutText>{errorMessage(result)}</CalloutText>
          </Callout>
        ) : result?.pullRequests.length ? (
          result.pullRequests.map(pull => (
            <PullRequestCard key={pull.number} pull={pull} />
          ))
        ) : (
          <Text color="gray">{MESSAGE.EMPTY}</Text>
        )}
      </div>
    </div>
  );
};
