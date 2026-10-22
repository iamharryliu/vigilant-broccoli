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

export const PREVIEW_DEPLOYMENTS_LAYOUT = {
  GRID: 'grid',
  STACK: 'stack',
} as const;

type PreviewDeploymentsLayout =
  (typeof PREVIEW_DEPLOYMENTS_LAYOUT)[keyof typeof PREVIEW_DEPLOYMENTS_LAYOUT];

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
  RATE_LIMITED_SERVER_HINT: 'Set GITHUB_TOKEN on the server to lift it.',
  RATE_LIMIT_RESET: 'Try again after',
};

const LINK_CLASS = 'text-blue-600 hover:underline dark:text-blue-400';
const SHORT_SHA_LENGTH = 7;

// GRID suits a wide desktop pane; STACK is one scrolling column with Apple's
// 44px minimum touch targets.
const LAYOUT_STYLE = {
  [PREVIEW_DEPLOYMENTS_LAYOUT.GRID]: {
    root: 'h-full overflow-auto flex flex-col gap-4',
    list: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
    card: 'p-4 flex flex-col gap-3',
    apps: 'flex flex-col gap-2',
    appRow: 'flex flex-wrap items-baseline gap-x-3 gap-y-1',
    appName: '',
    appLink: `${LINK_CLASS} break-all`,
    buttonSize: 'sm',
    iconSize: 14,
    showCommit: true,
  },
  [PREVIEW_DEPLOYMENTS_LAYOUT.STACK]: {
    root: 'mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-4',
    list: 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-[env(safe-area-inset-bottom)]',
    card: 'flex flex-col gap-2 p-4',
    apps: 'flex flex-col divide-y divide-gray-100 dark:divide-gray-800',
    appRow: 'flex items-center gap-4',
    appName: 'flex-1 truncate',
    appLink: `${LINK_CLASS} inline-flex min-h-[44px] items-center`,
    buttonSize: 'default',
    iconSize: 16,
    showCommit: false,
  },
} as const;

type LayoutStyle = (typeof LAYOUT_STYLE)[PreviewDeploymentsLayout];

const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' };

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

const errorMessage = (
  result: Extract<PreviewDeploymentsResult, { ok: false }>,
  showServerHint: boolean,
) =>
  result.error === PREVIEW_DEPLOYMENTS_ERROR.RATE_LIMITED
    ? `${MESSAGE.RATE_LIMITED}${showServerHint ? ` ${MESSAGE.RATE_LIMITED_SERVER_HINT}` : ''}${result.rateLimitResetAt ? ` ${MESSAGE.RATE_LIMIT_RESET} ${formatTime(result.rateLimitResetAt)}.` : ''}`
    : MESSAGE.UPSTREAM;

const PullRequestCard = ({
  pull,
  style,
}: {
  pull: PreviewDeploymentPullRequest;
  style: LayoutStyle;
}) => (
  <Card className={style.card}>
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
    <ul className={style.apps}>
      {pull.apps.map(app => (
        <li key={app.app} className={style.appRow}>
          <Text size="2" weight="medium" className={style.appName}>
            {app.app}
          </Text>
          <a
            href={app.aliasUrl}
            {...externalLinkProps}
            className={style.appLink}
          >
            <Text size="2">{LABEL.ALIAS}</Text>
          </a>
          <a
            href={app.buildUrl}
            {...externalLinkProps}
            className={style.appLink}
          >
            <Text size="2">{LABEL.BUILD}</Text>
          </a>
          {style.showCommit && (
            <Text size="1" color="gray">
              <code>{app.commit.slice(0, SHORT_SHA_LENGTH)}</code>
            </Text>
          )}
        </li>
      ))}
    </ul>
  </Card>
);

interface PreviewDeploymentsProps {
  // Resolves the result however the host app reaches GitHub: through its
  // authenticated /api/preview-deployments route, or straight from the browser.
  loadPreviewDeployments: () => Promise<PreviewDeploymentsResult>;
  layout?: PreviewDeploymentsLayout;
  // Public viewers cannot set the server's GITHUB_TOKEN, so they get no hint.
  showServerTokenHint?: boolean;
}

export const PreviewDeployments = ({
  loadPreviewDeployments,
  layout = PREVIEW_DEPLOYMENTS_LAYOUT.GRID,
  showServerTokenHint = true,
}: PreviewDeploymentsProps) => {
  const [result, setResult] = useState<PreviewDeploymentsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const style = LAYOUT_STYLE[layout];

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
    <div className={style.root}>
      <div className="flex items-center justify-end gap-3">
        {result?.ok && (
          <Text size="1" color="gray">
            {LABEL.UPDATED} {formatTime(result.fetchedAt)}
          </Text>
        )}
        <Button
          variant="outline"
          size={style.buttonSize}
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={style.iconSize} />
          {LABEL.REFRESH}
        </Button>
      </div>
      {loading && !result ? (
        <Text color="gray">{MESSAGE.LOADING}</Text>
      ) : result && !result.ok ? (
        <Callout color="red">
          <CalloutText>{errorMessage(result, showServerTokenHint)}</CalloutText>
        </Callout>
      ) : result?.pullRequests.length ? (
        <div className={style.list}>
          {result.pullRequests.map(pull => (
            <PullRequestCard key={pull.number} pull={pull} style={style} />
          ))}
        </div>
      ) : (
        <Text color="gray">{MESSAGE.EMPTY}</Text>
      )}
    </div>
  );
};
