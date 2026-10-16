// Emails the daily orphaned-services report written by
// projects/nx-workspace/scripts/prune-orphaned-services.ts, including when
// there are no orphans so a missing email means the job itself broke.

import { readFileSync } from 'fs';

const EMAIL_URL =
  process.env.EMAIL_URL ?? 'http://127.0.0.1:3000/api/send-email';
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'CI Reports <ci-reports@harryliu.dev>';
const API_KEY_HEADER = 'x-api-key';
const CONTENT_TYPE_HEADER = 'Content-Type';
const JSON_CONTENT_TYPE = 'application/json';

const REPORT_JSON_PATH = process.env.REPORT_JSON_PATH ?? '';
const REPORT_MD_PATH = process.env.REPORT_MD_PATH ?? '';
const RUN_URL = process.env.RUN_URL ?? '';
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN ?? '';

const report = JSON.parse(readFileSync(REPORT_JSON_PATH, 'utf8'));
const markdown = readFileSync(REPORT_MD_PATH, 'utf8');

const orphanTotal = report.providers.reduce(
  (sum, provider) => sum + provider.orphans.length,
  0,
);
const errorTotal = report.providers.reduce(
  (sum, provider) => sum + provider.errors.length,
  0,
);

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const subject = `Orphaned services: ${orphanTotal} orphan(s), ${errorTotal} error(s)`;
const text = `${markdown}\n\n${RUN_URL}`;
const html = `<pre style="font-family:monospace;font-size:13px;white-space:pre-wrap;">${escapeHtml(text)}</pre>`;

const response = await fetch(EMAIL_URL, {
  method: 'POST',
  headers: {
    [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
    [API_KEY_HEADER]: SHARED_APP_TOKEN,
  },
  body: JSON.stringify({
    to: report.emailTo,
    from: EMAIL_FROM,
    subject,
    html,
    text,
  }),
});

console.log(`orphaned-services-email: ${response.status}`);
if (!response.ok) process.exit(1);
