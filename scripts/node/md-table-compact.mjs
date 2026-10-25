// Strips Prettier's column padding from Markdown tables so committed rows only
// change when their own cells do. Output matches Prettier's compact table
// layout, so formatting a compacted file and compacting it again round-trips.
// Run as a pre-commit hook it guards committed content; see the Markdown table
// filter row in docs/code-quality-tools.md.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const FENCE_RE = /^\s*(`{3,}|~{3,})/;
const UNESCAPED_PIPE_RE = /(?<!\\)\|/;
const DELIMITER_CELL_RE = /^:?-+:?$/;
const TABLE_LINE_RE = /^\s*\|/;
const ROW_RE = /^(\s*)(.*?)(\r?)$/;
const FILTER_CONFIG_KEY = 'filter.mdtable.process';

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

const isFilterConfigured = () => {
  try {
    return (
      execFileSync('git', ['config', '--get', FILTER_CONFIG_KEY], {
        encoding: 'utf8',
      }).trim() !== ''
    );
  } catch {
    return false;
  }
};

// One `git cat-file --batch` call reads every staged copy, so an --all-files
// run does not spawn a Git process per file.
const readStaged = files => {
  const output = execFileSync('git', ['cat-file', '--batch'], {
    input: files.map(file => `:${file}\n`).join(''),
    maxBuffer: 256 * 1024 * 1024,
  });
  const staged = new Map();
  let offset = 0;
  for (const file of files) {
    const headerEnd = output.indexOf(0x0a, offset);
    const [, type, size] = output
      .subarray(offset, headerEnd)
      .toString('utf8')
      .split(' ');
    offset = headerEnd + 1;
    if (type !== 'blob') continue;
    const length = Number(size);
    staged.set(file, output.subarray(offset, offset + length).toString('utf8'));
    offset += length + 1;
  }
  return staged;
};

// With the filter configured the working tree is padded on purpose, so only
// the staged copy is checked. Without it (CI, fresh clones) the working tree
// is what gets committed, so it is fixed in place like any formatter hook.
const runHook = files => {
  const filterConfigured = isFilterConfigured();
  const staged = filterConfigured ? readStaged(files) : new Map();
  let failed = false;
  for (const file of files) {
    if (filterConfigured) {
      const content = staged.get(file);
      if (content !== undefined && compactMarkdownTables(content) !== content) {
        console.error(
          `${file}: staged copy has padded Markdown tables; run \`git add --renormalize -- ${file}\`.`,
        );
        failed = true;
      }
      continue;
    }
    const content = readFileSync(file, 'utf8');
    const compacted = compactMarkdownTables(content);
    if (compacted !== content) {
      writeFileSync(file, compacted);
      console.error(`${file}: compacted Markdown table padding.`);
      failed = true;
    }
  }
  if (failed && !filterConfigured) {
    console.error(
      'Committed Markdown tables must be compact. Add the `mdtable` filter from setup/dotfiles/.gitconfig to your Git config so `git add` compacts them automatically, then re-stage.',
    );
  }
  process.exit(failed ? 1 : 0);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runHook(process.argv.slice(2));
}
