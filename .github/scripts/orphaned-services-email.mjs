// Emails the orphaned-services report written by
// projects/nx-workspace/scripts/prune-orphaned-services.ts, only when there is
// at least one orphan or provider error; otherwise nothing is sent.

import { readFileSync } from 'fs';

const EMAIL_URL =
  process.env.EMAIL_URL ?? 'http://127.0.0.1:3000/api/send-email';
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'CI Reports <ci-reports@harryliu.dev>';
const API_KEY_HEADER = 'x-api-key';
const CONTENT_TYPE_HEADER = 'Content-Type';
const JSON_CONTENT_TYPE = 'application/json';
const APPLY_COMMAND =
  'cd projects/nx-workspace && pnpm exec tsx scripts/prune-orphaned-services.ts --apply';
const FONT = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";

const REPORT_JSON_PATH = process.env.REPORT_JSON_PATH ?? '';
const RUN_URL = process.env.RUN_URL ?? '';
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN ?? '';

const report = JSON.parse(readFileSync(REPORT_JSON_PATH, 'utf8'));

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const orphanTotal = report.providers.reduce(
  (sum, provider) => sum + provider.orphans.length,
  0,
);
const errors = report.providers.flatMap(provider =>
  provider.errors.map(
    message =>
      `could not list ${provider.provider}: ${message.replace(/^Listing failed: /, '')}`,
  ),
);

if (orphanTotal === 0 && errors.length === 0) {
  console.log('orphaned-services-email: nothing to report, no email sent.');
  process.exit(0);
}

const withOrphans = report.providers.filter(
  provider => provider.orphans.length,
);
const summary = `${orphanTotal} orphaned service(s)${errors.length ? `, ${errors.length} provider error(s)` : ''}.`;
const footer = `Run: ${RUN_URL}`;

const htmlSections = withOrphans.map(
  provider =>
    `<h3 style="margin:16px 0 4px;font-size:15px;">${escapeHtml(provider.provider)}</h3>` +
    `<ul style="margin:0;padding-left:20px;">${provider.orphanLinks
      .map(({ name, url }) =>
        url
          ? `<li><a href="${escapeHtml(url)}" style="color:#0b5fff;">${escapeHtml(name)}</a></li>`
          : `<li>${escapeHtml(name)}</li>`,
      )
      .join('')}</ul>`,
);
const htmlErrors = errors.map(
  message =>
    `<p style="margin:8px 0;color:#b42318;">${escapeHtml(message)}</p>`,
);
const html =
  `<div style="font-family:${FONT};font-size:14px;line-height:1.5;color:#1f2328;">` +
  `<p style="margin:0 0 8px;">${escapeHtml(summary)}</p>` +
  htmlErrors.join('') +
  htmlSections.join('') +
  `<p style="margin:20px 0 0;font-size:12px;color:#656d76;">` +
  `<a href="${escapeHtml(RUN_URL)}" style="color:#656d76;">Workflow run</a> · Delete locally: ` +
  `<code>${escapeHtml(APPLY_COMMAND)}</code></p></div>`;

const text = [
  summary,
  ...errors,
  ...withOrphans.flatMap(provider => [
    '',
    `${provider.provider}:`,
    ...provider.orphanLinks.map(
      ({ name, url }) => `- ${name}${url ? ` ${url}` : ''}`,
    ),
  ]),
  '',
  footer,
  `Delete locally: ${APPLY_COMMAND}`,
].join('\n');

const response = await fetch(EMAIL_URL, {
  method: 'POST',
  headers: {
    [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
    [API_KEY_HEADER]: SHARED_APP_TOKEN,
  },
  body: JSON.stringify({
    to: report.emailTo,
    from: EMAIL_FROM,
    subject: `Orphaned services: ${orphanTotal} orphan(s), ${errors.length} error(s)`,
    html,
    text,
  }),
});

console.log(`orphaned-services-email: ${response.status}`);
if (!response.ok) process.exit(1);
