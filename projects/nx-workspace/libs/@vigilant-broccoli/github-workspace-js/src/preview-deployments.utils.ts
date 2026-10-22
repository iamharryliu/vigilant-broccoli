import { HTTP_HEADERS, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  GITHUB_RATE_LIMIT_HEADER,
  PREVIEW_DEPLOYMENTS_CACHE_TTL_MS,
  PREVIEW_DEPLOYMENTS_ERROR,
  PREVIEW_DEPLOYMENTS_GITHUB_URL,
  PREVIEW_ENVIRONMENT_PATTERN,
} from './preview-deployments.consts';
import {
  GithubDeployment,
  GithubPullRequest,
  PreviewDeploymentApp,
  PreviewDeploymentPayload,
  PreviewDeploymentPullRequest,
  PreviewDeploymentsResult,
} from './preview-deployments.types';

const MS_PER_SECOND = 1000;
const PAYLOAD_STRING_KEYS = ['aliasUrl', 'buildUrl', 'commit'] as const;

const parsePreviewEnvironment = (environment: string) => {
  const match = PREVIEW_ENVIRONMENT_PATTERN.exec(environment);
  return match ? { prNumber: Number(match[1]), app: match[2] } : null;
};

const toPayload = (payload: unknown): Partial<PreviewDeploymentPayload> => {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return {};
    }
  }
  return payload && typeof payload === 'object' ? payload : {};
};

const toPreviewApp = (
  deployment: GithubDeployment,
  app: string,
): PreviewDeploymentApp | null => {
  const payload = toPayload(deployment.payload);
  if (!PAYLOAD_STRING_KEYS.every(key => typeof payload[key] === 'string'))
    return null;
  return {
    app,
    aliasUrl: payload.aliasUrl as string,
    buildUrl: payload.buildUrl as string,
    commit: payload.commit as string,
    deployedAt: deployment.created_at,
  };
};

// The deployments list is newest first, so the first deployment seen for an
// environment is that app's current preview.
export const groupPreviewDeployments = (
  deployments: GithubDeployment[],
  openPulls: GithubPullRequest[],
): PreviewDeploymentPullRequest[] => {
  const pullsByNumber = new Map(openPulls.map(pull => [pull.number, pull]));
  const latestByEnvironment = deployments.reduce((latest, deployment) => {
    const parsed = parsePreviewEnvironment(deployment.environment);
    if (
      !parsed ||
      !pullsByNumber.has(parsed.prNumber) ||
      latest.has(deployment.environment)
    )
      return latest;
    return latest.set(deployment.environment, {
      prNumber: parsed.prNumber,
      app: toPreviewApp(deployment, parsed.app),
    });
  }, new Map<string, { prNumber: number; app: PreviewDeploymentApp | null }>());

  const appsByPull = [...latestByEnvironment.values()].reduce(
    (grouped, { prNumber, app }) =>
      app
        ? grouped.set(prNumber, [...(grouped.get(prNumber) ?? []), app])
        : grouped,
    new Map<number, PreviewDeploymentApp[]>(),
  );

  return [...appsByPull]
    .sort(([a], [b]) => b - a)
    .map(([prNumber, apps]) => {
      const pull = pullsByNumber.get(prNumber) as GithubPullRequest;
      return {
        number: pull.number,
        title: pull.title,
        url: pull.html_url,
        author: pull.user?.login ?? null,
        headRef: pull.head.ref,
        apps: apps.sort((a, b) => a.app.localeCompare(b.app)),
      };
    });
};

const isRateLimited = (response: Response) =>
  response.status === HTTP_STATUS_CODES.TOO_MANY_REQUESTS ||
  (response.status === HTTP_STATUS_CODES.FORBIDDEN &&
    response.headers.get(GITHUB_RATE_LIMIT_HEADER.REMAINING) === '0');

const rateLimitResetAt = (response: Response) => {
  const reset = Number(response.headers.get(GITHUB_RATE_LIMIT_HEADER.RESET));
  return reset ? new Date(reset * MS_PER_SECOND).toISOString() : null;
};

export const fetchPreviewDeployments = async (
  token?: string,
): Promise<PreviewDeploymentsResult> => {
  const headers = {
    ...HTTP_HEADERS.ACCEPT.JSON,
    ...(token ? HTTP_HEADERS.AUTHORIZATION(token) : {}),
  };
  try {
    const responses = await Promise.all([
      fetch(PREVIEW_DEPLOYMENTS_GITHUB_URL.DEPLOYMENTS, { headers }),
      fetch(PREVIEW_DEPLOYMENTS_GITHUB_URL.OPEN_PULLS, { headers }),
    ]);
    const rateLimited = responses.find(isRateLimited);
    if (rateLimited)
      return {
        ok: false,
        error: PREVIEW_DEPLOYMENTS_ERROR.RATE_LIMITED,
        rateLimitResetAt: rateLimitResetAt(rateLimited),
      };
    if (responses.some(response => !response.ok))
      return {
        ok: false,
        error: PREVIEW_DEPLOYMENTS_ERROR.UPSTREAM,
        rateLimitResetAt: null,
      };
    const [deployments, openPulls] = await Promise.all([
      responses[0].json() as Promise<GithubDeployment[]>,
      responses[1].json() as Promise<GithubPullRequest[]>,
    ]);
    return {
      ok: true,
      pullRequests: groupPreviewDeployments(deployments, openPulls),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return {
      ok: false,
      error: PREVIEW_DEPLOYMENTS_ERROR.UPSTREAM,
      rateLimitResetAt: null,
    };
  }
};

let cachedResult: {
  result: PreviewDeploymentsResult;
  expiresAt: number;
} | null = null;

// Server-side, per process: only successes are cached, so a failed or
// rate-limited fetch is retried on the next request.
export const getPreviewDeployments = async (
  token?: string,
): Promise<PreviewDeploymentsResult> => {
  if (cachedResult && cachedResult.expiresAt > Date.now())
    return cachedResult.result;
  const result = await fetchPreviewDeployments(token);
  if (result.ok)
    cachedResult = {
      result,
      expiresAt: Date.now() + PREVIEW_DEPLOYMENTS_CACHE_TTL_MS,
    };
  return result;
};
