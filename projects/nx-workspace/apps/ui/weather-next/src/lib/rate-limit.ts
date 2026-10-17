import { NextRequest } from 'next/server';

const FORWARDED_FOR_HEADER = 'x-forwarded-for';
const RETRY_AFTER_HEADER = 'Retry-After';
const UNKNOWN_CLIENT = 'unknown';
const MS_PER_SECOND = 1000;

interface Window {
  count: number;
  resetAtMs: number;
}

export interface RateLimit {
  maxRequests: number;
  windowMs: number;
}

const windows = new Map<string, Window>();

const getClientId = (request: NextRequest) =>
  request.headers.get(FORWARDED_FOR_HEADER)?.split(',')[0].trim() ||
  UNKNOWN_CLIENT;

const pruneExpired = (nowMs: number) =>
  windows.forEach((window, key) => {
    if (window.resetAtMs <= nowMs) windows.delete(key);
  });

/**
 * Fixed-window counter held in module memory, so on serverless it limits per
 * warm instance rather than globally: it blunts a single client hammering the
 * route, not a distributed flood.
 */
export const getRetryAfterHeaders = (
  request: NextRequest,
  { maxRequests, windowMs }: RateLimit,
): Record<string, string> | null => {
  const nowMs = Date.now();
  pruneExpired(nowMs);

  const key = getClientId(request);
  const current = windows.get(key);
  const window =
    current && current.resetAtMs > nowMs
      ? current
      : { count: 0, resetAtMs: nowMs + windowMs };
  window.count += 1;
  windows.set(key, window);

  return window.count > maxRequests
    ? {
        [RETRY_AFTER_HEADER]: String(
          Math.ceil((window.resetAtMs - nowMs) / MS_PER_SECOND),
        ),
      }
    : null;
};
