// Renders the GitHub Actions job summary shared by every agentic workflow.
//
//   overview  the requested work and effective configuration, published before
//             the long agent job starts
//   result    the truthful outcome of a finished run, with its PR link
//
// Input is structured data in AGENTIC_* environment variables, never a
// pre-formatted string, so the layout lives here once. Free text (the prompt,
// question or instruction) is escaped into readable Markdown prose rather than
// fenced, so it wraps and keeps its paragraphs while arbitrary input cannot
// render as HTML or break the surrounding summary. Without GITHUB_STEP_SUMMARY
// the output goes to stdout, which is how the layout is previewed locally.

import { appendFileSync, writeFileSync } from 'node:fs';

const MODE = {
  OVERVIEW: 'overview',
  RESULT: 'result',
};

const AGENT_LABEL = { claude: 'Claude', codex: 'Codex' };
const FIREWALL_LABEL = { on: 'On', off: 'Off' };
const TRIGGER_LABEL = { workflow_dispatch: 'Manual', schedule: 'Scheduled' };
const CODEX_DEFAULT_MODEL = 'CLI default';

const OUTCOME = {
  'pr-created': 'Pull request created',
  'pr-updated': 'Pull request updated',
  'no-changes': 'Completed with no changes — no pull request opened',
  'no-pr': 'Completed without opening a pull request',
  dispatched: 'Child workflow dispatched — it has not finished yet',
  failed: 'Failed',
  cancelled: 'Cancelled',
};
const FAILED_WITH_PR = 'Failed — partial work saved as a draft pull request';

// A step summary is capped at 1 MiB. The dispatch input limit keeps a request
// far below that, so this guards a future caller rather than today's inputs.
const MAX_REQUEST_CHARS = 20_000;
const MAX_RENDERED_BYTES = 500_000;
const REQUEST_FILE_DEFAULT = 'agentic-request.txt';

const LINE_BREAK = '  \n';
const META_SEPARATOR = ' · ';
const URL_PATTERN = /^https:\/\/[^\s<>()]+$/;

const env = name => (process.env[name] ?? '').trim();

const escapeInline = text =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\\`*_[\]~|$]/g, '\\$&');

const escapeLine = line => {
  const [, indent, body] = /^([ \t]*)(.*)$/.exec(line);
  const spaces = indent.replace(/\t/g, '    ').replace(/ /g, '&nbsp;');
  const escaped = escapeInline(body);
  const blockSafe = indent
    ? escaped
    : escaped.replace(/^([#+\-=])/, '\\$1').replace(/^(\d+)([.)])/, '$1\\$2');
  return spaces + blockSafe;
};

const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

const renderProse = text =>
  text
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARS, '')
    .split(/\n[ \t]*\n+/)
    .map(paragraph => paragraph.replace(/^\n+|\n+$/g, ''))
    .filter(paragraph => paragraph.trim())
    .map(paragraph => paragraph.split('\n').map(escapeLine).join(LINE_BREAK))
    .join('\n\n');

const label = (name, value) => `**${name}:** ${value}`;

const linkText = url => {
  const pull = /\/pull\/(\d+)$/.exec(url);
  return pull ? `[#${pull[1]}](${url})` : `<${url}>`;
};

const urlOrText = value =>
  URL_PATTERN.test(value) ? linkText(value) : escapeInline(value);

const capitalize = value => value.charAt(0).toUpperCase() + value.slice(1);

const modelLabel = (agent, model) => {
  if (agent === 'codex') return escapeInline(model || CODEX_DEFAULT_MODEL);
  return model ? escapeInline(capitalize(model)) : '';
};

const metaLine = pairs =>
  pairs
    .filter(([, value]) => value)
    .map(([name, value]) => label(name, value))
    .join(META_SEPARATOR);

const boundedRequest = request => {
  const chars = [...request];
  if (chars.length <= MAX_REQUEST_CHARS) return { shown: request };
  const file = env('AGENTIC_REQUEST_FILE') || REQUEST_FILE_DEFAULT;
  writeFileSync(file, request);
  return {
    shown: chars.slice(0, MAX_REQUEST_CHARS).join(''),
    file,
    notice: `The request is ${chars.length.toLocaleString('en-US')} characters, too long to show in full here. The first ${MAX_REQUEST_CHARS.toLocaleString('en-US')} are shown; the complete request is attached to this run as the \`agentic-request\` artifact.`,
  };
};

const renderTask = () => {
  const description = env('AGENTIC_DESCRIPTION');
  const request = process.env.AGENTIC_TASK ?? '';
  if (!description && !request.trim()) return { markdown: '' };

  const { shown, file, notice } = boundedRequest(request);
  let prose = renderProse(shown);
  if (Buffer.byteLength(prose) > MAX_RENDERED_BYTES) {
    prose = prose.slice(0, MAX_RENDERED_BYTES);
  }

  const parts = ['## Task'];
  if (description) parts.push(escapeInline(description));
  if (prose) {
    if (description)
      parts.push(`**${env('AGENTIC_TASK_LABEL') || 'Request'}:**`);
    parts.push(prose);
  }
  if (notice) parts.push(`_${notice}_`);
  return { markdown: parts.join('\n\n'), file };
};

const renderOverview = () => {
  const agent = env('AGENTIC_AGENT');
  const firewall = env('AGENTIC_FIREWALL');
  const event = env('AGENTIC_EVENT') || env('GITHUB_EVENT_NAME');
  const pullRequest = env('AGENTIC_PULL_REQUEST');
  const todoIds = env('AGENTIC_TODO_IDS').split(/\s+/).filter(Boolean);

  const blocks = [`# ${escapeInline(env('AGENTIC_TITLE'))}`];
  const lines = [
    metaLine([
      ['Agent', AGENT_LABEL[agent] ?? escapeInline(agent)],
      ['Model', modelLabel(agent, env('AGENTIC_MODEL'))],
      ['Firewall', FIREWALL_LABEL[firewall] ?? escapeInline(firewall)],
    ]),
    metaLine([
      ['Trigger', TRIGGER_LABEL[event] ?? escapeInline(event)],
      ['Source', escapeInline(env('GITHUB_REF_NAME'))],
    ]),
    metaLine([['Operation', escapeInline(env('AGENTIC_OPERATION'))]]),
    metaLine([['Pull request', pullRequest && urlOrText(pullRequest)]]),
    metaLine([['TODO IDs', todoIds.map(id => escapeInline(id)).join(', ')]]),
  ].filter(Boolean);
  blocks.push(lines.join(LINE_BREAK));

  const task = renderTask();
  if (task.markdown) blocks.push(task.markdown);
  return { markdown: blocks.join('\n\n'), requestFile: task.file };
};

const renderResult = () => {
  const outcome = env('AGENTIC_OUTCOME');
  const pullRequest = env('AGENTIC_PR_URL');
  const exitCode = env('AGENTIC_EXIT_CODE');
  const childRun = env('AGENTIC_CHILD_RUN_URL');
  const note = env('AGENTIC_NOTE');
  const section = env('AGENTIC_LABEL');

  const headline =
    outcome === 'failed' && pullRequest
      ? FAILED_WITH_PR
      : (OUTCOME[outcome] ?? escapeInline(outcome));
  const lines = [
    label('Outcome', headline),
    pullRequest && label('Pull request', urlOrText(pullRequest)),
    childRun && label('Child run', urlOrText(childRun)),
    exitCode && exitCode !== '0' && label('Exit code', escapeInline(exitCode)),
    note && label('Details', escapeInline(note)),
  ].filter(Boolean);

  const heading = section ? `Result: ${escapeInline(section)}` : 'Result';
  return {
    markdown: [`## ${heading}`, lines.join(LINE_BREAK)].join('\n\n'),
  };
};

const RENDERERS = {
  [MODE.OVERVIEW]: renderOverview,
  [MODE.RESULT]: renderResult,
};

const render = RENDERERS[process.argv[2]];
if (!render) {
  console.error(
    `Usage: agentic-run-summary.mjs <${Object.values(MODE).join('|')}>`,
  );
  process.exit(1);
}

const { markdown, requestFile } = render();
const output = `${markdown}\n\n`;
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, output);
} else {
  process.stdout.write(output);
}
if (requestFile && process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `request_file=${requestFile}\n`);
}
