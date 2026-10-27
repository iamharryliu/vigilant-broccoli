// Strips Prettier's column padding from Markdown tables so committed rows only
// change when their own cells do. Output matches Prettier's compact table
// layout, so formatting a compacted file and compacting it again round-trips.
// Prettier pads tables, so this runs after every Prettier pass; see the
// Markdown table compaction row in docs/code-quality-tools.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const FENCE_RE = /^\s*(`{3,}|~{3,})/;
const UNESCAPED_PIPE_RE = /(?<!\\)\|/;
const DELIMITER_CELL_RE = /^:?-+:?$/;
const TABLE_LINE_RE = /^\s*\|/;
const ROW_RE = /^(\s*)(.*?)(\r?)$/;

const splitCells = row => {
  const inner = row.slice(1);
  const cells = inner.split(UNESCAPED_PIPE_RE);
  if (cells.length > 1 && cells[cells.length - 1].trim() === '') cells.pop();
  return cells.map(cell => cell.trim());
};

const parseRow = line => {
  const [, indent, row, eol] = line.match(ROW_RE);
  return { indent, cells: splitCells(row), eol };
};

const renderRow = ({ indent, cells, eol }) =>
  `${indent}| ${cells.join(' | ')} |${eol}`;

const compactDelimiterCell = cell => {
  const left = cell.startsWith(':');
  const right = cell.endsWith(':');
  if (left && right) return ':-:';
  if (left) return ':--';
  if (right) return '--:';
  return '---';
};

const isTableLine = line => TABLE_LINE_RE.test(line);

const isDelimiterRow = line =>
  isTableLine(line) &&
  parseRow(line).cells.every(cell => DELIMITER_CELL_RE.test(cell));

const fenceOf = line => line.match(FENCE_RE)?.[1];

const closesFence = (line, fence) => {
  const candidate = fenceOf(line);
  return (
    candidate !== undefined &&
    candidate[0] === fence[0] &&
    candidate.length >= fence.length &&
    line.trim() === candidate
  );
};

export const compactMarkdownTables = content => {
  const lines = content.split('\n');
  let fence;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (fence) {
      if (closesFence(line, fence)) fence = undefined;
      continue;
    }
    fence = fenceOf(line);
    if (fence) continue;

    const next = lines[index + 1];
    if (!isTableLine(line) || next === undefined || !isDelimiterRow(next)) {
      continue;
    }
    const header = parseRow(line);
    const delimiter = parseRow(next);
    if (header.cells.length !== delimiter.cells.length) continue;

    lines[index] = renderRow(header);
    lines[index + 1] = renderRow({
      ...delimiter,
      cells: delimiter.cells.map(compactDelimiterCell),
    });
    index += 2;
    while (index < lines.length && isTableLine(lines[index])) {
      lines[index] = renderRow(parseRow(lines[index]));
      index++;
    }
    index--;
  }
  return lines.join('\n');
};

export const hasMarkdownTable = content =>
  content.split('\n').some(isDelimiterRow);

// Compacts the working files in place. The pre-commit hook fails when it had
// to change something so the fix gets re-staged; --write (used right after
// Prettier in format-staged.sh) only rewrites, since Prettier re-pads tables.
const run = ([...args]) => {
  const quiet = args[0] === '--write';
  const files = quiet ? args.slice(1) : args;
  let failed = false;
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const compacted = compactMarkdownTables(content);
    if (compacted === content) continue;
    writeFileSync(file, compacted);
    if (!quiet) {
      console.error(`${file}: compacted Markdown table padding.`);
      failed = true;
    }
  }
  process.exit(failed ? 1 : 0);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  run(process.argv.slice(2));
}
