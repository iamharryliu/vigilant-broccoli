// Keeps one Chore row in TODO.md in step with the orphaned-services report
// written by projects/nx-workspace/scripts/prune-orphaned-services.ts: adds it
// when orphans appear, rewrites it when the list changes and removes it once
// nothing is orphaned. The row is found by DESCRIPTION_MARKER, never by id, so
// it survives being moved or re-prioritized by hand. Writes `action=<added|
// updated|removed|none>` and the orphan count to $GITHUB_OUTPUT.

import { randomBytes } from 'crypto';
import { appendFileSync, readFileSync, writeFileSync } from 'fs';

const REPORT_JSON_PATH = process.env.REPORT_JSON_PATH ?? '';
const TODO_PATH = process.env.TODO_PATH ?? 'TODO.md';
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT ?? '';

const CHORE_TYPE = 'Chore';
// Mirrors the Type order in docs/todo-pattern.md, which keeps rows grouped by
// Type; a new row lands after the last row of Chore or an earlier Type.
const TYPE_ORDER = [
  'Security',
  'Performance',
  'Maintenance',
  CHORE_TYPE,
  'Refactor',
  'Feature Enhancements',
  'UI Cleanup',
  'Not so serious',
];
const TYPE_CELL_INDEX = 1;
const GENERATED_CELLS_START = 5;
const DESCRIPTION_MARKER = '`cron-prune-orphaned-services` found';
const NEW_ROW_PRIORITY = 'P3';
const NEW_ROW_AGENT = 'human';
const NEW_ROW_EFFORT = 'S';
const APPLY_COMMAND =
  'cd projects/nx-workspace && pnpm exec tsx scripts/prune-orphaned-services.ts --apply';
const TODO_ROW_RE = /^\|\s*[0-9a-f]{6}\s*\|/;
const UNESCAPED_PIPE_RE = /(?<!\\)\|/g;
const TABLE_LINE_PREFIX = '|';
const ACTION = {
  ADDED: 'added',
  UPDATED: 'updated',
  REMOVED: 'removed',
  NONE: 'none',
};

const report = JSON.parse(readFileSync(REPORT_JSON_PATH, 'utf8'));
const lines = readFileSync(TODO_PATH, 'utf8').split('\n');

const escapeCell = value => value.replace(/\|/g, '\\|');
const splitCells = line =>
  line
    .trim()
    .slice(1, -1)
    .split(UNESCAPED_PIPE_RE)
    .map(cell => cell.trim());
const renderRow = cells => `| ${cells.join(' | ')} |`;

const withOrphans = report.providers.filter(({ orphans }) => orphans.length);
const orphanTotal = withOrphans.reduce(
  (sum, { orphans }) => sum + orphans.length,
  0,
);

const contentCells = () => {
  const providerNames = withOrphans.map(({ provider }) => provider).join(', ');
  const brief = `${orphanTotal} deployed service(s) on ${providerNames} are not declared anywhere in the repo, so nothing here deploys or manages them. Confirm each is unused, then delete them with the prune script's --apply run.`;
  const description = [
    `${DESCRIPTION_MARKER} ${orphanTotal} live service(s) that no \`project.json\`, Fly or Wrangler config, or Terraform file declares:`,
    ...withOrphans.map(
      ({ provider, orphanLinks }) =>
        `- ${provider}: ${orphanLinks
          .map(({ name, url }) => (url ? `[${name}](${url})` : `\`${name}\``))
          .join(', ')}`,
    ),
  ].join('<br>');
  const recommendedFix = [
    '1. Open each listed service and confirm it is unused.',
    `2. Delete them locally with \`${APPLY_COMMAND}\`; it asks for \`--force\` above its deletion cap.`,
    '3. To keep one, declare it in a `project.json`, Fly or Wrangler config, or `.tf` file instead.',
    '4. The next `cron-prune-orphaned-services` run removes this row once nothing is orphaned.',
  ].join('<br>');
  return [brief, description, recommendedFix].map(escapeCell);
};

const existingIdx = lines.findIndex(
  line => TODO_ROW_RE.test(line) && line.includes(DESCRIPTION_MARKER),
);

const choreInsertIdx = () => {
  const tableStart = lines.findIndex(line =>
    line.startsWith(TABLE_LINE_PREFIX),
  );
  if (tableStart === -1) throw new Error('TODO.md has no table.');
  const choreRank = TYPE_ORDER.indexOf(CHORE_TYPE);
  // Header and separator rows come first, so the default slot is after them.
  let insertAt = tableStart + 2;
  lines.forEach((line, idx) => {
    if (!TODO_ROW_RE.test(line)) return;
    const rank = TYPE_ORDER.indexOf(splitCells(line)[TYPE_CELL_INDEX]);
    if (rank !== -1 && rank <= choreRank) insertAt = idx + 1;
  });
  return insertAt;
};

const newId = () => {
  const content = lines.join('\n');
  let id;
  do id = randomBytes(3).toString('hex');
  while (content.includes(id));
  return id;
};

let action = ACTION.NONE;
if (orphanTotal === 0) {
  if (existingIdx !== -1) {
    lines.splice(existingIdx, 1);
    action = ACTION.REMOVED;
  }
} else if (existingIdx === -1) {
  lines.splice(
    choreInsertIdx(),
    0,
    renderRow([
      newId(),
      CHORE_TYPE,
      NEW_ROW_PRIORITY,
      NEW_ROW_AGENT,
      NEW_ROW_EFFORT,
      ...contentCells(),
    ]),
  );
  action = ACTION.ADDED;
} else {
  // Id, Type, Priority, Agent and Effort may have been adjusted by hand; only
  // the generated cells are rewritten.
  const cells = splitCells(lines[existingIdx]);
  const updated = renderRow([
    ...cells.slice(0, GENERATED_CELLS_START),
    ...contentCells(),
  ]);
  if (renderRow(cells) !== updated) {
    lines[existingIdx] = updated;
    action = ACTION.UPDATED;
  }
}

if (action !== ACTION.NONE) writeFileSync(TODO_PATH, lines.join('\n'));
console.log(`orphaned-services-todo: ${action} (${orphanTotal} orphan(s)).`);
if (GITHUB_OUTPUT) {
  appendFileSync(
    GITHUB_OUTPUT,
    `action=${action}\norphan_total=${orphanTotal}\n`,
  );
}
