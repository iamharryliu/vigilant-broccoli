export const JSON_HEADERS = { 'Content-Type': 'application/json' };
export const ERR_NO_EMAILS = 'Please enter valid email addresses';

export const parseEmails = (input: string) =>
  input
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

export const postEmails = (endpoint: string, emails: string[]) =>
  fetch(endpoint, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ emails }),
  });
