import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { buildAuthHeaders } from '../app/providers/auth-provider';

export const ERR_NO_EMAILS = 'Please enter valid email addresses';

export const authFetch = async (
  endpoint: string,
  init: RequestInit = {},
): Promise<Response> => {
  const authHeaders = await buildAuthHeaders();
  const headers = new Headers(authHeaders);
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  return fetch(endpoint, { ...init, headers });
};

export const postEmails = (endpoint: string, emails: string[]) =>
  authFetch(endpoint, {
    method: HTTP_METHOD.POST,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify({ emails }),
  });
