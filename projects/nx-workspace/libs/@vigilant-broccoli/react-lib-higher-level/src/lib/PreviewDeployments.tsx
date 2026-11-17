'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Callout, CalloutText, Card, Text } from '@vigilant-broccoli/react-lib';
import {
  PREVIEW_DEPLOYMENTS_ERROR,
  PreviewDeploymentPullRequest,
  PreviewDeploymentsResult,
} from '@vigilant-broccoli/github-workspace-js';

const LABEL = {
  PREVIEW: 'Preview',
  UPDATED: 'Updated',
  BY: 'by',
};

const MESSAGE = {
  NO_OPEN_PULLS: 'There are no open pull requests.',
  NO_PREVIEWS: (count: number) =>
    `${count} open pull ${count === 1 ? 'request has' : 'requests have'} no deployed preview yet.`,
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

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];
const relativeTimeFormat = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

const formatAge = (iso: string) => {
  const elapsed = Date.now() - new Date(iso).getTime();
  const [unit, size] =
    RELATIVE_UNITS.find(([, size]) => elapsed >= size) ??
    RELATIVE_UNITS[RELATIVE_UNITS.length - 1];
  return relativeTimeFormat.format(-Math.floor(elapsed / size), unit);
};

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
            <Text size="2">{LABEL.PREVIEW}</Text>
          </a>
          <Text size="1" color="gray">
            <code>{app.commit.slice(0, SHORT_SHA_LENGTH)}</code> ·{' '}
            <time dateTime={app.deployedAt} title={app.deployedAt}>
              {formatAge(app.deployedAt)}
            </time>
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

// Each load costs two unauthenticated GitHub calls against a 60 per hour per
// IP limit, so one visible tab polling every 5 minutes uses 24.
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export const PreviewDeployments = ({
  loadPreviewDeployments,
}: PreviewDeploymentsProps) => {
  const [result, setResult] = useState<PreviewDeploymentsResult | null>(null);
  const lastFetchedAt = useRef(0);

  const refresh = useCallback(async () => {
    lastFetchedAt.current = Date.now();
    try {
      setResult(await loadPreviewDeployments());
    } catch {
      setResult({
        ok: false,
        error: PREVIEW_DEPLOYMENTS_ERROR.UPSTREAM,
        rateLimitResetAt: null,
      });
    }
  }, [loadPreviewDeployments]);

  // Polling and the focus refetch both pause while the tab is hidden and stop
  // once GitHub rate-limits this IP, since further calls would only fail.
  const rateLimited =
    result?.ok === false &&
    result.error === PREVIEW_DEPLOYMENTS_ERROR.RATE_LIMITED;

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (rateLimited) return;
    const refreshIfStale = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastFetchedAt.current >= REFRESH_INTERVAL_MS
      )
        refresh();
    };
    const timer = setInterval(refreshIfStale, REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshIfStale);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshIfStale);
    };
  }, [refresh, rateLimited]);

  return (
    <div className={STYLE.root}>
      {result?.ok && (
        <Text size="1" color="gray" className="text-right">
          {LABEL.UPDATED} {formatTime(result.fetchedAt)}
        </Text>
      )}
      {!result ? null : !result.ok ? (
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
        <Text color="gray">
          {result.openPullCount
            ? MESSAGE.NO_PREVIEWS(result.openPullCount)
            : MESSAGE.NO_OPEN_PULLS}
        </Text>
      )}
    </div>
  );
};
