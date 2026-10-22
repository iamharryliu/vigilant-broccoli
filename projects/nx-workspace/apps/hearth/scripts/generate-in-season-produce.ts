import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

// The notes live outside projects/nx-workspace; this works on Vercel because
// `vercel build` runs on the runner against the full checkout (see
// docs/features/in-season-produce.md).
const INGREDIENTS_DIR = resolve(
  process.cwd(),
  '../../../../notes/hobbies/cooking/ingredients',
);
const OUTPUT_FILE = resolve(
  process.cwd(),
  'src/lib/generated/in-season-produce.json',
);

const SOURCES = [
  { category: 'fruits', file: 'fruits.md' },
  { category: 'vegetables', file: 'vegetables.md' },
];

const SEASONAL_TIMELINE_HEADING = '### Seasonal Timeline';
const GANTT_BLOCK = /```mermaid\s*\n(gantt\b[\s\S]*?)```/;
const GANTT_DIRECTIVE = /^(title|dateFormat|axisFormat|todayMarker|section)\b/;
const GANTT_ENTRY =
  /^(.+?)\s*:\s*(\d{4})-(\d{2})-(\d{2})\s*,\s*(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS_IN_YEAR = 12;

const fail = (file: string, message: string): never => {
  throw new Error(`[in-season-produce] ${file}: ${message}`);
};

const monthsBetween = (start: number, end: number): number[] => {
  const length = ((end - start + MONTHS_IN_YEAR) % MONTHS_IN_YEAR) + 1;
  return Array.from(
    { length },
    (_, i) => ((start - 1 + i) % MONTHS_IN_YEAR) + 1,
  );
};

const parseGantt = (file: string, markdown: string) => {
  const timelineStart = markdown.indexOf(SEASONAL_TIMELINE_HEADING);
  if (timelineStart === -1) {
    fail(file, `missing "${SEASONAL_TIMELINE_HEADING}"`);
  }
  const block = markdown.slice(timelineStart).match(GANTT_BLOCK);
  if (!block) fail(file, 'no mermaid gantt block under the Seasonal Timeline');

  const monthsByName = new Map<string, Set<number>>();
  block![1].split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line === 'gantt' || GANTT_DIRECTIVE.test(line)) return;
    const entry = line.match(GANTT_ENTRY);
    if (!entry) fail(file, `unparseable gantt line ${i + 1}: "${line}"`);
    const [, name, , startMonth, , , endMonth] = entry!;
    const start = Number(startMonth);
    const end = Number(endMonth);
    if (![start, end].every(m => m >= 1 && m <= MONTHS_IN_YEAR)) {
      fail(file, `invalid month in gantt line: "${line}"`);
    }
    const months = monthsByName.get(name) ?? new Set<number>();
    monthsBetween(start, end).forEach(m => months.add(m));
    monthsByName.set(name, months);
  });

  if (!monthsByName.size) fail(file, 'gantt block has no entries');
  return [...monthsByName]
    .map(([name, months]) => ({
      name,
      months: [...months].sort((a, b) => a - b),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const output = Object.fromEntries(
  SOURCES.map(({ category, file }) => [
    category,
    parseGantt(file, readFileSync(resolve(INGREDIENTS_DIR, file), 'utf-8')),
  ]),
);

mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${OUTPUT_FILE}`);
