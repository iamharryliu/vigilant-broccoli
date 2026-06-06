import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';

export const ERR_NO_EMAILS = 'Please enter valid email addresses';

export const parseEmails = (input: string) =>
  input
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

export const postEmails = (endpoint: string, emails: string[]) =>
  fetch(endpoint, {
    method: HTTP_METHOD.POST,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify({ emails }),
  });
