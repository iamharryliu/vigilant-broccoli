import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { buildAuthHeaders } from '../app/providers/auth-provider';

export const ERR_REQUEST_FAILED = 'Request failed';

export const errorMessage = (
  err: unknown,
  fallback: string = ERR_REQUEST_FAILED,
): string => (err instanceof Error && err.message ? err.message : fallback);

export const authFetch = async (
  endpoint: string,
  init: RequestInit = {},
): Promise<Response> => {
  const authHeaders = await buildAuthHeaders();
  const headers = new Headers(authHeaders);
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  return fetch(endpoint, { ...init, headers });
};

const readError = async (res: Response): Promise<string> => {
  const text = await res.text().catch(() => '');
  return text.trim() || `${ERR_REQUEST_FAILED} (${res.status})`;
};

export const authFetchOk = async (
  endpoint: string,
  init: RequestInit = {},
): Promise<Response> => {
  const res = await authFetch(endpoint, init);
  if (!res.ok) throw new Error(await readError(res));
  return res;
};

export const postEmails = (endpoint: string, emails: string[]) =>
  authFetchOk(endpoint, {
    method: HTTP_METHOD.POST,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify({ emails }),
  });
