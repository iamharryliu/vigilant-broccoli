import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const GITHUB_API_BASE = 'https://api.github.com';
const PREVIEW_DEPLOYMENTS_REPOSITORY = 'iamharryliu/vigilant-broccoli';
const GITHUB_PAGE_SIZE = 100;

export const PREVIEW_DEPLOYMENTS_GITHUB_URL = {
  DEPLOYMENTS: `${GITHUB_API_BASE}/repos/${PREVIEW_DEPLOYMENTS_REPOSITORY}/deployments?per_page=${GITHUB_PAGE_SIZE}`,
  OPEN_PULLS: `${GITHUB_API_BASE}/repos/${PREVIEW_DEPLOYMENTS_REPOSITORY}/pulls?state=open&per_page=${GITHUB_PAGE_SIZE}`,
} as const;

export const PREVIEW_DEPLOYMENTS_API_PATH = '/api/preview-deployments';

// Written by .github/scripts/record-preview-deployments.mjs as pr-<n>/<app>.
export const PREVIEW_ENVIRONMENT_PATTERN = /^pr-(\d+)\/([a-z0-9-]+)$/;

// Unauthenticated GitHub calls are limited to 60 per hour per IP; each fetch
// spends two.
export const PREVIEW_DEPLOYMENTS_CACHE_TTL_MS = 3 * 60 * 1000;

export const GITHUB_RATE_LIMIT_HEADER = {
  REMAINING: 'x-ratelimit-remaining',
  RESET: 'x-ratelimit-reset',
} as const;

export const PREVIEW_DEPLOYMENTS_ERROR = {
  RATE_LIMITED: 'rate_limited',
  UPSTREAM: 'upstream',
} as const;

export type PreviewDeploymentsError =
  (typeof PREVIEW_DEPLOYMENTS_ERROR)[keyof typeof PREVIEW_DEPLOYMENTS_ERROR];

export const PREVIEW_DEPLOYMENTS_ERROR_STATUS: Record<
  PreviewDeploymentsError,
  number
> = {
  [PREVIEW_DEPLOYMENTS_ERROR.RATE_LIMITED]: HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
  [PREVIEW_DEPLOYMENTS_ERROR.UPSTREAM]: HTTP_STATUS_CODES.BAD_GATEWAY,
};
