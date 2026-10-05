// Alerts by email when an LLM CI check failed because the provider account
// ran out of credits, so the owner can top it up without reading CI logs.

const EMAIL_URL =
  process.env.EMAIL_URL ?? 'http://127.0.0.1:3001/api/send-email';
const EMAIL_TO = process.env.EMAIL_TO ?? 'harryliu1995@gmail.com';
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'CI Alerts <ci-alerts@harryliu.dev>';
const API_KEY_HEADER = 'x-api-key';
const CONTENT_TYPE_HEADER = 'Content-Type';
const JSON_CONTENT_TYPE = 'application/json';

const WORKFLOW = process.env.WORKFLOW_NAME ?? '';
const ENVIRONMENT = process.env.TARGET_ENVIRONMENT ?? '';
const MODEL = process.env.MODEL ?? '';
const RUN_URL = process.env.RUN_URL ?? '';
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN ?? '';

const subject = `LLM out of credits: ${WORKFLOW}${ENVIRONMENT ? ` (${ENVIRONMENT})` : ''}`;
const text = [
  `${WORKFLOW}${ENVIRONMENT ? ` on ${ENVIRONMENT}` : ''} failed because the ${MODEL} provider account is out of credits or quota.`,
  'Top up the account, then re-run the workflow.',
  '',
  RUN_URL,
].join('\n');
const html = `<p>${text.replace(/\n\n/, '</p><p>').replace(/\n/g, '<br>')}</p>`;

const response = await fetch(EMAIL_URL, {
  method: 'POST',
  headers: {
    [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
    [API_KEY_HEADER]: SHARED_APP_TOKEN,
  },
  body: JSON.stringify({ to: EMAIL_TO, from: EMAIL_FROM, subject, html, text }),
});

console.log(`llm-out-of-credits-email: ${response.status}`);
if (!response.ok) process.exit(1);
