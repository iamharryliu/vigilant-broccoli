import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

const OUTPUT_FILE =
  process.argv[2] ?? 'apps/ui/pages-index/public/repo-timeline.json';

const RECORD_SEPARATOR = '\x00';
const FIELD_SEPARATOR = '\t';
const BINARY_NUMSTAT = '-';
const GIT_MAX_BUFFER = 512 * 1024 * 1024;
// Single-file changes this large are vendored/generated assets, not authored code
const MAX_FILE_LINE_CHANGE = 100_000;
const PR_SUBJECT_PATTERN = /\(#\d+\)$|^Merge pull request #\d+/;
const EXCLUDED_FILE_PATTERN =
  /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|poetry\.lock|go\.sum)$/;

type DayStats = [
  commits: number,
  pullRequests: number,
  added: number,
  deleted: number,
];

const git = (args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: GIT_MAX_BUFFER });

const toCount = (value: string) =>
  value === BINARY_NUMSTAT ? 0 : Number(value);

const days = new Map<string, DayStats>();
const getDay = (date: string) => {
  const existing = days.get(date);
  if (existing) return existing;
  const created: DayStats = [0, 0, 0, 0];
  days.set(date, created);
  return created;
};

git(['log', '--format=%x00%cs%x09%P%x09%s', '--numstat'])
  .split(RECORD_SEPARATOR)
  .filter(Boolean)
  .forEach(record => {
    const [header, ...statLines] = record.split('\n');
    const [date, parents, subject] = header.split(FIELD_SEPARATOR);
    const day = getDay(date);
    const isMerge = parents.trim().includes(' ');

    if (!isMerge) day[0] += 1;
    if (PR_SUBJECT_PATTERN.test(subject)) day[1] += 1;

    statLines.filter(Boolean).forEach(line => {
      const [added, deleted, file] = line.split(FIELD_SEPARATOR);
      const addedCount = toCount(added);
      const deletedCount = toCount(deleted);
      if (
        EXCLUDED_FILE_PATTERN.test(file) ||
        Math.max(addedCount, deletedCount) > MAX_FILE_LINE_CHANGE
      ) {
        return;
      }
      day[2] += addedCount;
      day[3] += deletedCount;
    });
  });

const timeline = {
  days: [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => [date, ...stats]),
};

mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
writeFileSync(OUTPUT_FILE, JSON.stringify(timeline));
console.log(`Wrote ${timeline.days.length} days to ${OUTPUT_FILE}`);
