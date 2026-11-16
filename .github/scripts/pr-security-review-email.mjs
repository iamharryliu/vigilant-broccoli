// Sends the ci-pr-security-review alert email for a high or critical verdict.
// The PR metadata, verdict and pre-pass metadata come from the review job's
// outputs; all of it is PR- or LLM-derived, so every value is HTML-escaped.
// EMAIL_DRY_RUN=true prints the message instead of sending it.

const EMAIL_URL =
  process.env.EMAIL_URL ?? 'http://127.0.0.1:3000/api/send-email';
const EMAIL_TO = process.env.EMAIL_TO ?? 'harryliu1995@gmail.com';
const EMAIL_FROM =
  process.env.EMAIL_FROM ??
  'PR Security Review <ci-pr-security-review@harryliu.dev>';
const API_KEY_HEADER = 'x-api-key';
const CONTENT_TYPE_HEADER = 'Content-Type';
const JSON_CONTENT_TYPE = 'application/json';

const DRY_RUN = process.env.EMAIL_DRY_RUN === 'true';
const RUN_URL = process.env.RUN_URL ?? '';
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN ?? '';
const PR = JSON.parse(process.env.PR || '{}');
const VERDICT = JSON.parse(process.env.VERDICT || '{}');
const META = JSON.parse(process.env.META || '{}');

const SEVERITY_COLOR = {
  critical: '#82071e',
  high: '#cf222e',
};

const SANS_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const COLOR = {
  text: '#1f2328',
  muted: '#59636e',
  link: '#0969da',
  surface: '#f6f8fa',
};

const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const severity = String(VERDICT.severity ?? 'unknown');
const severityColor = SEVERITY_COLOR[severity] ?? COLOR.text;
const findings = Array.isArray(VERDICT.findings) ? VERDICT.findings : [];
const highRisk = Array.isArray(META.high_risk) ? META.high_risk : [];
// A newline in a PR title would otherwise inject extra mail headers downstream.
const subjectTitle = String(PR.title ?? '').replace(/[\r\n]+/g, ' ');
const subject = `PR security review ${severity.toUpperCase()}: ${subjectTitle} (#${PR.number})`;

const paragraph = content => `<p style="margin:0 0 12px 0;">${content}</p>`;
const link = (url, label) =>
  `<a href="${escapeHtml(url)}" style="color:${COLOR.link};">${label}</a>`;

const findingsHtml = findings.length
  ? `<ol style="margin:0 0 12px 0;padding-left:20px;">${findings
      .map(
        finding =>
          `<li style="margin:0 0 8px 0;"><strong>${escapeHtml(finding.file)}</strong> — ${escapeHtml(finding.summary)}` +
          (finding.evidence
            ? `<pre style="margin:4px 0 0 0;padding:8px;background:${COLOR.surface};font-family:${MONO_FONT};font-size:12px;white-space:pre-wrap;">${escapeHtml(finding.evidence)}</pre>`
            : '') +
          `</li>`,
      )
      .join('')}</ol>`
  : '';
const highRiskHtml = highRisk.length
  ? `<p style="margin:0 0 4px 0;">High-risk paths:</p><ul style="margin:0 0 12px 0;">${highRisk
      .map(
        entry =>
          `<li>${escapeHtml(entry.file)} <span style="color:${COLOR.muted};">(${escapeHtml(entry.category)})</span></li>`,
      )
      .join('')}</ul>`
  : '';
const truncatedHtml = META.truncated
  ? paragraph(
      `<strong>The diff was truncated</strong>; ${escapeHtml(META.omitted_total ?? 0)} file(s) were not reviewed.`,
    )
  : '';

const html =
  `<div style="font-family:${SANS_FONT};font-size:14px;color:${COLOR.text};padding:16px;">` +
  paragraph(
    `Security review flagged ${link(PR.url, `#${escapeHtml(PR.number)}`)} ${escapeHtml(PR.title)} as <strong style="color:${severityColor};">${escapeHtml(severity)}</strong>. Check it before merging.`,
  ) +
  paragraph(
    `<span style="color:${COLOR.muted};">Author ${escapeHtml(PR.author)} · head <code>${escapeHtml(String(PR.head_sha ?? '').slice(0, 7))}</code></span>`,
  ) +
  paragraph(escapeHtml(VERDICT.summary)) +
  findingsHtml +
  highRiskHtml +
  truncatedHtml +
  `<p style="margin:0;">${link(PR.url, 'View pull request')} · ${link(RUN_URL, 'View run')}</p>` +
  `</div>`;

const text = [
  `Security review flagged #${PR.number} ${subjectTitle} as ${severity}. Check it before merging.`,
  `Author ${PR.author ?? ''}, head ${String(PR.head_sha ?? '').slice(0, 7)}`,
  '',
  VERDICT.summary ?? '',
  ...(findings.length
    ? [
        '',
        'Findings:',
        ...findings.map(
          (finding, index) =>
            `${index + 1}. ${finding.file} — ${finding.summary}${finding.evidence ? `\n   ${finding.evidence}` : ''}`,
        ),
      ]
    : []),
  ...(highRisk.length
    ? [
        '',
        'High-risk paths:',
        ...highRisk.map(entry => `- ${entry.file} (${entry.category})`),
      ]
    : []),
  ...(META.truncated ? ['', 'The diff was truncated.'] : []),
  '',
  PR.url ?? '',
  RUN_URL,
].join('\n');

const message = { to: EMAIL_TO, from: EMAIL_FROM, subject, html, text };

if (DRY_RUN) {
  console.log(JSON.stringify(message, null, 2));
} else {
  const response = await fetch(EMAIL_URL, {
    method: 'POST',
    headers: {
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      [API_KEY_HEADER]: SHARED_APP_TOKEN,
    },
    body: JSON.stringify(message),
  });
  console.log(`pr-security-review-email: ${response.status}`);
  // A dropped security alert must be visible, so a failed send fails the job.
  if (!response.ok) process.exit(1);
}
