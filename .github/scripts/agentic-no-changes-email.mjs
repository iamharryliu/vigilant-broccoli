// Emails the owner when an agentic run deliberately ended with no changes, so
// a declined request is noticed without opening the run. Sent straight through
// Resend with the RESEND_API_KEY the calling action imports from Vault.
//
// The recipient and sender are the shared EMAIL_ADDRESS and
// SENDER_EMAIL_ADDRESS consts. Their package is CommonJS TypeScript, which
// plain node cannot import, so the literals are read out of its source.

import { readFileSync } from 'node:fs';

const RESEND_URL = 'https://api.resend.com/emails';
const AUTHORIZATION_HEADER = 'Authorization';
const CONTENT_TYPE_HEADER = 'Content-Type';
const JSON_CONTENT_TYPE = 'application/json';
const SENDER_NAME = 'Agentic Runs';
const PERSONAL_CONSTS = new URL(
  '../../projects/nx-workspace/libs/@vigilant-broccoli/personal-common-js/src/index.ts',
  import.meta.url,
);

const personalConst = name => {
  const match = new RegExp(`export const ${name} = '([^']+)'`).exec(
    readFileSync(PERSONAL_CONSTS, 'utf8'),
  );
  if (!match) throw new Error(`${name} not found in ${PERSONAL_CONSTS}`);
  return match[1];
};

const env = name => (process.env[name] ?? '').trim();

const OPERATION = env('AGENTIC_OPERATION');
const REQUEST = env('AGENTIC_REQUEST');
const REASON = env('AGENTIC_REASON') || 'The agent recorded no reason.';
const PULL_REQUEST = env('AGENTIC_PULL_REQUEST');
const RUN_URL = env('RUN_URL');
const RESEND_API_KEY = env('RESEND_API_KEY');

const escapeHtml = value =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const sections = [
  ['Operation', OPERATION],
  ['Pull request', PULL_REQUEST],
  ['Request', REQUEST],
  ['Reason', REASON],
  ['Run', RUN_URL],
].filter(([, value]) => value);

const subject = `${OPERATION}: completed with no changes`;
const text = sections.map(([name, value]) => `${name}:\n${value}`).join('\n\n');
const html = sections
  .map(
    ([name, value]) =>
      `<p><strong>${name}</strong><br>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`,
  )
  .join('');

const response = await fetch(RESEND_URL, {
  method: 'POST',
  headers: {
    [AUTHORIZATION_HEADER]: `Bearer ${RESEND_API_KEY}`,
    [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
  },
  body: JSON.stringify({
    from: `${SENDER_NAME} <${personalConst('SENDER_EMAIL_ADDRESS')}>`,
    to: [personalConst('EMAIL_ADDRESS')],
    subject,
    text,
    html,
  }),
});

console.log(`agentic-no-changes-email: ${response.status}`);
if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}
