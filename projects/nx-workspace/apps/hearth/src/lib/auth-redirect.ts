import { ROUTES } from './routes';

export const NEXT_PARAM = 'next';

// Survives the OAuth round trip in the same tab even if Supabase drops the
// callback's query string (an allow-list mismatch falls back to site_url).
const PENDING_NEXT_STORAGE_KEY = 'hearth-auth-next';

const PLACEHOLDER_ORIGIN = 'http://placeholder.invalid';

// A signed-in visit to an auth page redirects to `next`, so one of these as
// `next` would loop.
export const AUTH_ROUTES: string[] = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.AUTH_CALLBACK,
];

// Only same-origin relative paths: rejects absolute URLs, protocol-relative
// `//host` and backslash variants that browsers normalize to `//host`.
export const getSafeNextPath = (
  value: string | null | undefined,
): string | null => {
  if (!value || !value.startsWith('/') || /^\/[/\\]/.test(value)) return null;
  const url = new URL(value, PLACEHOLDER_ORIGIN);
  if (url.origin !== PLACEHOLDER_ORIGIN) return null;
  if (AUTH_ROUTES.some(route => url.pathname.startsWith(route))) return null;
  return `${url.pathname}${url.search}${url.hash}`;
};

export const getPathname = (path: string) =>
  new URL(path, PLACEHOLDER_ORIGIN).pathname;

export const withNextParam = (path: string, next: string | null) =>
  next ? `${path}?${NEXT_PARAM}=${encodeURIComponent(next)}` : path;

export const getNextFromSearch = (search: string) =>
  getSafeNextPath(new URLSearchParams(search).get(NEXT_PARAM));

export const storePendingNext = (next: string | null) => {
  if (next) sessionStorage.setItem(PENDING_NEXT_STORAGE_KEY, next);
};

export const getPendingNext = () =>
  getSafeNextPath(sessionStorage.getItem(PENDING_NEXT_STORAGE_KEY));

export const clearPendingNext = () =>
  sessionStorage.removeItem(PENDING_NEXT_STORAGE_KEY);

export const resolvePostAuthPath = (search: string) =>
  getNextFromSearch(search) ?? getPendingNext() ?? ROUTES.HOME;

export const buildAuthCallbackUrl = (next: string | null) =>
  `${window.location.origin}${withNextParam(ROUTES.AUTH_CALLBACK, next)}`;
