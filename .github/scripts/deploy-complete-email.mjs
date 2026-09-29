// Sends the post-deploy notification email: which PR (resolved from the
// deployed commit via `gh api .../commits/{sha}/pulls` in the calling
// workflow) shipped, and whether the deploy succeeded.

const EMAIL_URL =
  process.env.EMAIL_URL ?? 'http://127.0.0.1:3000/api/send-email';
const EMAIL_TO = process.env.EMAIL_TO ?? 'harryliu1995@gmail.com';
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Deploy Notifier <ci-deploy@harryliu.dev>';
const API_KEY_HEADER = 'x-api-key';
const CONTENT_TYPE_HEADER = 'Content-Type';
const JSON_CONTENT_TYPE = 'application/json';

const SUCCESS = 'success';

const CONCLUSION = process.env.DEPLOY_CONCLUSION ?? 'failure';
const ENVIRONMENT = process.env.DEPLOY_ENVIRONMENT ?? '';
const RUN_URL = process.env.RUN_URL ?? '';
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN ?? '';
const COMMIT_SHA = process.env.COMMIT_SHA ?? '';
const COMMIT_MESSAGE = process.env.COMMIT_MESSAGE ?? '';
const PR_NUMBER = process.env.PR_NUMBER ?? '';
const PR_TITLE = process.env.PR_TITLE ?? '';
const PR_URL = process.env.PR_URL ?? '';

const SANS_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const COLOR = {
  text: '#1f2328',
  muted: '#59636e',
  link: '#0969da',
  success: '#1a7f37',
  failure: '#cf222e',
};

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const shortSha = COMMIT_SHA.slice(0, 7);
const commitSummary = COMMIT_MESSAGE.split('\n')[0] || shortSha || 'unknown commit';
const subjectSummary = PR_NUMBER ? `${PR_TITLE} (#${PR_NUMBER})` : commitSummary;
const subject = `Deploy ${CONCLUSION}${ENVIRONMENT ? ` (${ENVIRONMENT})` : ''}: ${subjectSummary}`;
const resultColor = CONCLUSION === SUCCESS ? COLOR.success : COLOR.failure;

const prLineHtml = PR_NUMBER
  ? `<a href="${escapeHtml(PR_URL)}" style="color:${COLOR.link};">#${PR_NUMBER}</a> ${escapeHtml(PR_TITLE)}`
  : escapeHtml(commitSummary);
const prLineText = PR_NUMBER
  ? `#${PR_NUMBER} ${PR_TITLE}\n${PR_URL}`
  : commitSummary;

const html =
  `<div style="font-family:${SANS_FONT};font-size:14px;color:${COLOR.text};padding:16px;">` +
  `<p style="margin:0 0 12px 0;">Deploy${ENVIRONMENT ? ` to <strong>${escapeHtml(ENVIRONMENT)}</strong>` : ''} <strong style="color:${resultColor};">${escapeHtml(CONCLUSION)}</strong>.</p>` +
  `<p style="margin:0 0 12px 0;">${prLineHtml}</p>` +
  `<p style="margin:0 0 12px 0;color:${COLOR.muted};">Commit <code>${escapeHtml(shortSha)}</code></p>` +
  `<p style="margin:0;"><a href="${escapeHtml(RUN_URL)}" style="color:${COLOR.link};">View run</a></p>` +
  `</div>`;

const text = [
  `Deploy${ENVIRONMENT ? ` to ${ENVIRONMENT}` : ''} ${CONCLUSION}.`,
  prLineText,
  `Commit ${shortSha}`,
  '',
  RUN_URL,
].join('\n');

const response = await fetch(EMAIL_URL, {
  method: 'POST',
  headers: {
    [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
    [API_KEY_HEADER]: SHARED_APP_TOKEN,
  },
  body: JSON.stringify({ to: EMAIL_TO, from: EMAIL_FROM, subject, html, text }),
});

console.log(`deploy-complete-email: ${response.status}`);
