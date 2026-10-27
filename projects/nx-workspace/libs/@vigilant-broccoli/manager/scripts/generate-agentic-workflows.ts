import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../../../../../..');

const README_PATH = process.argv[2] ?? resolve(REPO_ROOT, 'README.md');
const OUTPUT_PATH =
  process.argv[3] ??
  resolve(SCRIPT_DIR, '../src/lib/generated/agentic-workflows.json');

const SECTION_HEADING = '### Agentic';
const HEADING_PATTERN = /^#{1,6}\s/;
const TABLE_ROW_PREFIX = '|';
const SEPARATOR_CELL_PATTERN = /^:?-+:?$/;
const REQUIRED_COLUMNS = ['Phase', 'Description', 'Actions'];
const NOT_APPLICABLE = 'N/A';
const NAME_SEPARATOR = ' — ';
const NAME_PATTERN = /^`([^`]+)`$/;
const ACTIONS_LINK_PATTERN = /^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/;

function fail(message: string): never {
  console.error(
    `generate-agentic-workflows: ${message}\nThe "${SECTION_HEADING}" table in ${README_PATH} feeds the desktop and mobile Agentic tabs; see docs/features/home.md in vb-manager-next-mobile for the format it must keep.`,
  );
  process.exit(1);
}

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map(cell => cell.trim());

const readTableLines = (readme: string) => {
  const lines = readme.split('\n');
  const start = lines.findIndex(line => line.trim() === SECTION_HEADING);
  if (start === -1) fail(`heading "${SECTION_HEADING}" not found.`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => HEADING_PATTERN.test(line));
  const section = end === -1 ? rest : rest.slice(0, end);
  return section
    .map(line => line.trim())
    .filter(line => line.startsWith(TABLE_ROW_PREFIX));
};

const parseRow = (cells: string[], columns: string[], line: string) => {
  if (cells.length !== columns.length)
    fail(
      `expected ${columns.length} cells but found ${cells.length} in row: ${line}`,
    );
  const [phase, description, actions] = cells;
  const [codeName, ...summaryParts] = description.split(NAME_SEPARATOR);
  const summary = summaryParts.join(NAME_SEPARATOR);
  if (!phase || !NAME_PATTERN.test(codeName) || !summary)
    fail(
      `Description must be "\`name\`${NAME_SEPARATOR}summary" with a Phase in row: ${line}`,
    );
  if (actions === NOT_APPLICABLE) return null;
  // The link text is the workflow name shown in GitHub Actions.
  const [, name, url] = ACTIONS_LINK_PATTERN.exec(actions) ?? [];
  if (!name || !url)
    fail(
      `Actions must be "${NOT_APPLICABLE}" or a markdown link in row: ${line}`,
    );
  return { phase, name, summary, url };
};

const parseWorkflows = (readme: string) => {
  const [header, separator, ...rows] = readTableLines(readme);
  if (!header || !separator) fail(`no table found under "${SECTION_HEADING}".`);
  const columns = splitRow(header);
  if (
    !REQUIRED_COLUMNS.every((column, index) => columns[index] === column) ||
    !splitRow(separator).every(cell => SEPARATOR_CELL_PATTERN.test(cell))
  )
    fail(
      `table must start with columns ${REQUIRED_COLUMNS.join(' | ')}; found: ${columns.join(' | ')}`,
    );
  return rows.flatMap(row => {
    const parsed = parseRow(splitRow(row), columns, row);
    return parsed ? [parsed] : [];
  });
};

const groupByPhase = (workflows: ReturnType<typeof parseWorkflows>) => {
  const byPhase = new Map<
    string,
    { name: string; summary: string; url: string }[]
  >();
  workflows.forEach(({ phase, ...workflow }) =>
    byPhase.set(phase, [...(byPhase.get(phase) ?? []), workflow]),
  );
  return [...byPhase.entries()].map(([name, entries]) => ({
    name,
    workflows: entries,
  }));
};

const workflows = parseWorkflows(readFileSync(README_PATH, 'utf8'));
if (!workflows.length) fail('the table has no workflows with an Actions link.');

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(
  OUTPUT_PATH,
  `${JSON.stringify({ phases: groupByPhase(workflows) }, null, 2)}\n`,
);
console.log(`Wrote ${workflows.length} workflows to ${OUTPUT_PATH}`);
