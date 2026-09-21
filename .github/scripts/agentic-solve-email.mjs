// Builds and sends the manual-agentic-solve notification email. The run's diff
// is rendered as a GitHub-style split-gutter patch so the change can be read
// from the inbox without opening the PR.
//
// Input is the JSON Lines file written by infrastructure/agent-sandbox/solve-todo.sh
// (one record per solve: label, title, url, summary, diff).

import { readFileSync } from 'node:fs';

const EMAIL_URL =
  process.env.EMAIL_URL ?? 'http://127.0.0.1:3000/api/send-email';
const EMAIL_TO = process.env.EMAIL_TO ?? 'harryliu1995@gmail.com';
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Harry Liu <ci-agentic-solve@harryliu.dev>';
const API_KEY_HEADER = 'x-api-key';
const CONTENT_TYPE_HEADER = 'Content-Type';
const JSON_CONTENT_TYPE = 'application/json';

const RESULT = process.env.SOLVE_RESULT ?? 'failed';
const RUN_URL = process.env.RUN_URL ?? '';
const PR_DETAILS_FILE = process.env.PR_DETAILS_FILE ?? '';
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN ?? '';

const SUCCEEDED = 'succeeded';

// Gmail clips a message past ~102KB, which would hide the "View run" footer, so
// the rendered patch is budgeted well under that and the rest points at the PR.
const MAX_DIFF_ROWS = 300;
const MAX_DIFF_HTML_CHARS = 45000;
const MAX_TEXT_DIFF_CHARS = 8000;

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
// Single-quoted family names on purpose: these stacks are emitted inside
// double-quoted style="..." attributes, where a double quote ends the attribute.
const SANS_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const COLOR = {
  text: '#1f2328',
  muted: '#59636e',
  border: '#d1d9e0',
  surface: '#f6f8fa',
  link: '#0969da',
  addBg: '#e6ffec',
  addGutter: '#ccffd8',
  delBg: '#ffebe9',
  delGutter: '#ffd7d5',
  hunkBg: '#ddf4ff',
  hunkText: '#0550ae',
  contextBg: '#ffffff',
  success: '#1a7f37',
  failure: '#cf222e',
};

// Per-row inline styles blow the message past Gmail's clip threshold on any
// real diff, so the repeated styling lives in classes and each row keeps only
// the cheap, universally supported fallbacks: `bgcolor` for the gutter/body
// tint and <pre> for monospace + preserved indentation when a client (Outlook
// desktop) drops the stylesheet entirely.
const STYLESHEET = `<style>
.vb-diff{border-collapse:collapse;width:100%;table-layout:fixed;}
.vb-diff td{padding:0;vertical-align:top;}
.vb-n{padding:0 8px !important;text-align:right;font-family:${MONO_FONT};font-size:11px;line-height:18px;color:${COLOR.muted};}
.vb-c{padding:0 10px !important;}
.vb-c pre{margin:0;font-family:${MONO_FONT};font-size:12px;line-height:18px;color:${COLOR.text};white-space:pre-wrap;word-break:break-word;}
.vb-meta pre{color:${COLOR.muted};}
.vb-hunk pre{color:${COLOR.hunkText};}
.vb-file{border:1px solid ${COLOR.border};border-radius:6px;overflow:hidden;margin:0 0 16px 0;}
.vb-file-name{background:${COLOR.surface};border-bottom:1px solid ${COLOR.border};padding:8px 12px;font-family:${MONO_FONT};font-size:12px;color:${COLOR.text};word-break:break-all;}
.vb-body{font-family:${SANS_FONT};font-size:14px;line-height:1.6;color:${COLOR.text};}
.vb-note{font-family:${SANS_FONT};font-size:13px;color:${COLOR.muted};margin:0 0 12px 0;}
.vb-add{color:${COLOR.success};}
.vb-del{color:${COLOR.failure};}
.vb-code{font-family:${MONO_FONT};font-size:12px;background:${COLOR.surface};padding:1px 4px;border-radius:4px;}
</style>`;

const LINE_KIND = {
  ADD: 'add',
  DEL: 'del',
  CONTEXT: 'context',
  HUNK: 'hunk',
  META: 'meta',
};

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const readEntries = () => {
  if (!PR_DETAILS_FILE) return [];
  return readFileSync(PR_DETAILS_FILE, 'utf8')
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => JSON.parse(line));
};

// --- diff parsing -----------------------------------------------------------

const fileNameFrom = header => {
  const match = header.match(/^diff --git a\/(.+?) b\/(.+)$/);
  if (!match) return header.replace(/^diff --git /, '');
  const [, from, to] = match;
  return from === to ? to : `${from} → ${to}`;
};

const parseDiff = diff => {
  const files = [];
  let current;
  let oldLn = 0;
  let newLn = 0;

  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) {
      current = {
        name: fileNameFrom(line),
        rows: [],
        additions: 0,
        deletions: 0,
      };
      files.push(current);
      continue;
    }
    if (!current) continue;
    if (
      /^(index |--- |\+\+\+ |old mode |new mode |similarity index |rename (from|to) )/.test(
        line,
      )
    )
      continue;
    if (/^(new file mode |deleted file mode |Binary files )/.test(line)) {
      current.rows.push({ kind: LINE_KIND.META, text: line });
      continue;
    }
    const hunk = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      oldLn = Number(hunk[1]);
      newLn = Number(hunk[2]);
      current.rows.push({ kind: LINE_KIND.HUNK, text: line });
      continue;
    }
    if (line.startsWith('+')) {
      current.additions += 1;
      current.rows.push({
        kind: LINE_KIND.ADD,
        text: line.slice(1),
        newLn: newLn++,
      });
      continue;
    }
    if (line.startsWith('-')) {
      current.deletions += 1;
      current.rows.push({
        kind: LINE_KIND.DEL,
        text: line.slice(1),
        oldLn: oldLn++,
      });
      continue;
    }
    if (line.startsWith('\\')) continue;
    if (line.startsWith(' ') || line === '') {
      current.rows.push({
        kind: LINE_KIND.CONTEXT,
        text: line.slice(1),
        oldLn: oldLn++,
        newLn: newLn++,
      });
    }
  }

  return files;
};

// --- rendering --------------------------------------------------------------

const ROW_STYLE = {
  [LINE_KIND.ADD]: { body: COLOR.addBg, gutter: COLOR.addGutter, marker: '+' },
  [LINE_KIND.DEL]: { body: COLOR.delBg, gutter: COLOR.delGutter, marker: '-' },
  [LINE_KIND.CONTEXT]: {
    body: COLOR.contextBg,
    gutter: COLOR.contextBg,
    marker: ' ',
  },
};

const renderRow = row => {
  if (row.kind === LINE_KIND.HUNK || row.kind === LINE_KIND.META) {
    const isHunk = row.kind === LINE_KIND.HUNK;
    const cls = isHunk ? 'vb-c vb-hunk' : 'vb-c vb-meta';
    const bg = isHunk ? COLOR.hunkBg : COLOR.surface;
    return `<tr><td class="${cls}" colspan="3" bgcolor="${bg}"><pre style="margin:0">${escapeHtml(row.text)}</pre></td></tr>`;
  }
  const { body, gutter, marker } = ROW_STYLE[row.kind];
  return (
    `<tr>` +
    `<td class="vb-n" bgcolor="${gutter}">${row.oldLn ?? ''}</td>` +
    `<td class="vb-n" bgcolor="${gutter}">${row.newLn ?? ''}</td>` +
    `<td class="vb-c" bgcolor="${body}"><pre style="margin:0">${escapeHtml(marker + row.text)}</pre></td>` +
    `</tr>`
  );
};

// A binary file has no counted lines; a `+0 -0` badge on it reads as a bug.
const renderStat = (additions, deletions) =>
  additions + deletions === 0
    ? ''
    : `<span class="vb-add" style="color:${COLOR.success};">+${additions}</span> ` +
      `<span class="vb-del" style="color:${COLOR.failure};">&minus;${deletions}</span>`;

const renderFile = (file, rowBudget) => {
  const rows = file.rows.slice(0, rowBudget);
  const clipped = file.rows.length - rows.length;
  const clippedNote = clipped
    ? `<tr><td class="vb-c vb-meta" colspan="3" bgcolor="${COLOR.surface}"><pre style="margin:0">… ${clipped} more line${clipped === 1 ? '' : 's'} not shown</pre></td></tr>`
    : '';

  return (
    `<div class="vb-file" style="border:1px solid ${COLOR.border};border-radius:6px;margin:0 0 16px 0;">` +
    `<div class="vb-file-name" style="background:${COLOR.surface};border-bottom:1px solid ${COLOR.border};padding:8px 12px;">` +
    `${escapeHtml(file.name)} &nbsp;${renderStat(file.additions, file.deletions)}` +
    `</div>` +
    `<table class="vb-diff" cellpadding="0" cellspacing="0" border="0" width="100%">` +
    `<colgroup><col width="50" style="width:50px;"><col width="50" style="width:50px;"><col></colgroup>` +
    rows.map(renderRow).join('') +
    clippedNote +
    `</table>` +
    `</div>`
  );
};

// The budget is shared across every entry: a run that solves three TODO ids
// sends one email, so a per-diff cap would still add up past the clip limit.
const createBudget = () => ({
  rows: MAX_DIFF_ROWS,
  chars: MAX_DIFF_HTML_CHARS,
});

const renderDiff = (diff, budget) => {
  const files = parseDiff(diff);
  if (files.length === 0) return '';

  const additions = files.reduce((sum, file) => sum + file.additions, 0);
  const deletions = files.reduce((sum, file) => sum + file.deletions, 0);
  const statLine =
    `<p class="vb-note" style="font-family:${SANS_FONT};font-size:13px;color:${COLOR.muted};margin:0 0 12px 0;">` +
    `${files.length} file${files.length === 1 ? '' : 's'} changed · ${renderStat(additions, deletions)}</p>`;

  const rendered = [];
  let omitted = 0;

  for (const file of files) {
    if (budget.rows <= 0 || budget.chars <= 0) {
      omitted += 1;
      continue;
    }
    const html = renderFile(file, budget.rows);
    rendered.push(html);
    budget.chars -= html.length;
    budget.rows -= Math.min(file.rows.length, budget.rows);
  }

  const omittedNote = omitted
    ? `<p class="vb-note" style="font-family:${SANS_FONT};font-size:13px;color:${COLOR.muted};margin:0 0 12px 0;">Diff truncated — ${omitted} more file${omitted === 1 ? '' : 's'} in the pull request.</p>`
    : '';

  return statLine + rendered.join('') + omittedNote;
};

// The agent writes pr_summary as markdown bullets; render just enough of it.
const renderSummary = summary => {
  const inline = text =>
    escapeHtml(text)
      .replace(
        /`([^`]+)`/g,
        `<code class="vb-code" style="font-family:${MONO_FONT};">$1</code>`,
      )
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  const items = summary
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-*]\s*/, ''));

  if (items.length === 0) return '';
  return (
    `<ul class="vb-body" style="margin:0 0 16px 0;padding-left:20px;font-family:${SANS_FONT};font-size:14px;color:${COLOR.text};">` +
    items.map(item => `<li>${inline(item)}</li>`).join('') +
    `</ul>`
  );
};

const renderEntry = (entry, budget) => {
  const heading = entry.label ? `${entry.label}: ${entry.title}` : entry.title;
  const link = entry.url
    ? `<p style="margin:0 0 12px 0;font-family:${SANS_FONT};font-size:14px;"><a href="${escapeHtml(entry.url)}" style="color:${COLOR.link};">${escapeHtml(entry.url)}</a></p>`
    : '';

  return (
    `<div style="margin:0 0 32px 0;">` +
    `<h2 style="margin:0 0 8px 0;font-family:${SANS_FONT};font-size:17px;color:${COLOR.text};">${escapeHtml(heading)}</h2>` +
    link +
    renderSummary(entry.summary ?? '') +
    renderDiff(entry.diff ?? '', budget) +
    `</div>`
  );
};

const renderHtml = entries => {
  const budget = createBudget();
  const resultColor = RESULT === SUCCEEDED ? COLOR.success : COLOR.failure;
  return (
    STYLESHEET +
    `<div style="max-width:900px;margin:0 auto;padding:16px;background:#ffffff;">` +
    `<p style="margin:0 0 20px 0;font-family:${SANS_FONT};font-size:15px;color:${COLOR.text};">` +
    `The agentic solve workflow <strong style="color:${resultColor};">${escapeHtml(RESULT)}</strong>.</p>` +
    entries.map(entry => renderEntry(entry, budget)).join('') +
    `<p style="margin:0;font-family:${SANS_FONT};font-size:14px;">` +
    `<a href="${escapeHtml(RUN_URL)}" style="color:${COLOR.link};">View run</a></p>` +
    `</div>`
  );
};

const renderText = entries => {
  const blocks = entries.map(entry => {
    const heading = entry.label
      ? `${entry.label}: ${entry.title}`
      : entry.title;
    const diff = entry.diff ?? '';
    const clipped =
      diff.length > MAX_TEXT_DIFF_CHARS ? '\n… diff truncated …' : '';
    return [
      heading,
      entry.url,
      '',
      entry.summary,
      '',
      diff.slice(0, MAX_TEXT_DIFF_CHARS) + clipped,
    ]
      .filter(Boolean)
      .join('\n');
  });
  return [
    `The agentic solve workflow ${RESULT}.`,
    '',
    ...blocks,
    '',
    RUN_URL,
  ].join('\n');
};

const entries = readEntries();
const response = await fetch(EMAIL_URL, {
  method: 'POST',
  headers: {
    [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
    [API_KEY_HEADER]: SHARED_APP_TOKEN,
  },
  body: JSON.stringify({
    to: EMAIL_TO,
    from: EMAIL_FROM,
    subject: `Agentic solve ${RESULT}`,
    html: renderHtml(entries),
    text: renderText(entries),
  }),
});

console.log(
  `agentic-solve-email: ${response.status} (${entries.length} PR detail record(s))`,
);
