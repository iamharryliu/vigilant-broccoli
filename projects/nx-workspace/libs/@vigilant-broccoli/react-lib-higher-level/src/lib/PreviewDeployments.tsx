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
  PREVIEW_DEPLOYMENTS_ERROR,
  PreviewDeploymentPullRequest,
  PreviewDeploymentsResult,
} from '@vigilant-broccoli/github-workspace-js';

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
    'GitHub API rate limit reached (60 unauthenticated requests per hour).',
  RATE_LIMIT_RESET: 'Try again after',
};

const LINK_CLASS = 'text-blue-600 hover:underline dark:text-blue-400';
const SHORT_SHA_LENGTH = 7;

const STYLE = {
  root: 'h-full overflow-auto flex flex-col gap-4',
  list: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
  card: 'p-4 flex flex-col gap-3',
  apps: 'flex flex-col gap-2',
  appRow: 'flex flex-wrap items-baseline gap-x-3 gap-y-1',
  appLink: `${LINK_CLASS} break-all`,
};

const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' };

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

const errorMessage = (
  result: Extract<PreviewDeploymentsResult, { ok: false }>,
) =>
  result.error === PREVIEW_DEPLOYMENTS_ERROR.RATE_LIMITED
    ? `${MESSAGE.RATE_LIMITED}${result.rateLimitResetAt ? ` ${MESSAGE.RATE_LIMIT_RESET} ${formatTime(result.rateLimitResetAt)}.` : ''}`
    : MESSAGE.UPSTREAM;

const PullRequestCard = ({ pull }: { pull: PreviewDeploymentPullRequest }) => (
  <Card className={STYLE.card}>
    <div className="flex flex-col gap-1">
      <a href={pull.url} {...externalLinkProps} className={LINK_CLASS}>
        <Text weight="bold">
          #{pull.number} {pull.title}
        </Text>
      </a>
      <Text size="2" color="gray" className="break-all">
        {pull.author && `${LABEL.BY} ${pull.author} · `}
        <code>{pull.headRef}</code>
      </Text>
    </div>
    <ul className={STYLE.apps}>
      {pull.apps.map(app => (
        <li key={app.app} className={STYLE.appRow}>
          <Text size="2" weight="medium">
            {app.app}
          </Text>
          <a
            href={app.aliasUrl}
            {...externalLinkProps}
            className={STYLE.appLink}
          >
            <Text size="2">{LABEL.ALIAS}</Text>
          </a>
          <a
            href={app.buildUrl}
            {...externalLinkProps}
            className={STYLE.appLink}
          >
            <Text size="2">{LABEL.BUILD}</Text>
          </a>
          <Text size="1" color="gray">
            <code>{app.commit.slice(0, SHORT_SHA_LENGTH)}</code>
          </Text>
        </li>
      ))}
    </ul>
  </Card>
);

interface PreviewDeploymentsProps {
  // Resolves the result however the host app reaches GitHub.
  loadPreviewDeployments: () => Promise<PreviewDeploymentsResult>;
}

export const PreviewDeployments = ({
  loadPreviewDeployments,
}: PreviewDeploymentsProps) => {
  const [result, setResult] = useState<PreviewDeploymentsResult | null>(null);
  const [loading, setLoading] = useState(true);

  // On load and on demand only: unauthenticated GitHub calls are limited to
  // 60 per hour per IP, so no polling.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setResult(await loadPreviewDeployments());
    } catch {
      setResult({
        ok: false,
        error: PREVIEW_DEPLOYMENTS_ERROR.UPSTREAM,
        rateLimitResetAt: null,
      });
    }
    setLoading(false);
  }, [loadPreviewDeployments]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className={STYLE.root}>
      <div className="flex items-center justify-end gap-3">
        {result?.ok && (
          <Text size="1" color="gray">
            {LABEL.UPDATED} {formatTime(result.fetchedAt)}
          </Text>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={14} />
          {LABEL.REFRESH}
        </Button>
      </div>
      {loading && !result ? (
        <Text color="gray">{MESSAGE.LOADING}</Text>
      ) : result && !result.ok ? (
        <Callout color="red">
          <CalloutText>{errorMessage(result)}</CalloutText>
        </Callout>
      ) : result?.pullRequests.length ? (
        <div className={STYLE.list}>
          {result.pullRequests.map(pull => (
            <PullRequestCard key={pull.number} pull={pull} />
          ))}
        </div>
      ) : (
        <Text color="gray">{MESSAGE.EMPTY}</Text>
      )}
    </div>
  );
};
