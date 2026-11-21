// Interactive cheatsheet: browse the fenced block of a cheatsheet Markdown file
// by header group, filter by typing, and run the picked command.
//
//   node scripts/node/cheatsheet.mjs <markdown> [--prefix "pnpm run"] [--output <file>] [--print]
//
// --prefix   prepended to the picked command (e.g. "pnpm run" for script names)
// --output   write the final command line to <file> instead of running it, so a
//            shell function can eval it in the caller's shell (aliases, cd)
// --print    print the sheet; also the fallback when stdout is not a terminal

import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const FENCE = '```';
// The command column ends at the first run of two or more spaces; lines whose
// usage overflows the column use a single space, so placeholders are detected
// token by token instead.
const COLUMN_GAP_RE = /\s{2,}/;
const PLACEHOLDER_TOKEN_RE = /^(<.*|\[.*|.*\.\.\.|'.*'|-.*|\|)$/;
const NEEDS_INPUT_RE = /[<[']|\.\.\.| \/ /;
const INFO_ONLY_PREFIX = '(';
const CONTINUATION_INDENT = 4;

const KEY = {
  UP: ['\x1b[A', '\x10'],
  DOWN: ['\x1b[B', '\x0e'],
  RIGHT: ['\x1b[C'],
  LEFT: ['\x1b[D'],
  ENTER: ['\r', '\n'],
  BACKSPACE: ['\x7f', '\b'],
  ESC: ['\x1b'],
  CTRL_C: ['\x03'],
};
const is = (key, name) => KEY[name].includes(key);

const ANSI = {
  ALT_SCREEN_ON: '\x1b[?1049h',
  ALT_SCREEN_OFF: '\x1b[?1049l',
  CURSOR_HIDE: '\x1b[?25l',
  CURSOR_SHOW: '\x1b[?25h',
  HOME: '\x1b[H',
  CLEAR_LINE: '\x1b[2K',
  CLEAR_DOWN: '\x1b[J',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  INVERSE: '\x1b[7m',
  CYAN: '\x1b[36m',
};
// Title, filter line and a blank line above the list; a blank line and the
// help line below it.
const CHROME_ROWS = 5;
const DEFAULT_COLUMNS = 100;
const DEFAULT_ROWS = 30;
const HELP =
  '↑/↓ move · type to filter · →/Enter open group · ← back · Enter run · Esc/Ctrl-C quit';

const parseArgs = argv => {
  const options = {
    file: undefined,
    prefix: '',
    output: undefined,
    print: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--prefix') options.prefix = argv[++i] ?? '';
    else if (arg === '--output') options.output = argv[++i];
    else if (arg === '--print') options.print = true;
    else options.file = arg;
  }
  if (!options.file) {
    console.error(
      'Usage: cheatsheet.mjs <markdown> [--prefix <text>] [--output <file>] [--print]',
    );
    process.exit(1);
  }
  return options;
};

const readBlock = file => {
  const lines = readFileSync(resolve(REPO_ROOT, file), 'utf8').split('\n');
  const start = lines.indexOf(FENCE);
  const end = lines.indexOf(FENCE, start + 1);
  return lines.slice(start + 1, end);
};

const splitEntry = text => {
  const gap = text.match(COLUMN_GAP_RE);
  if (gap) {
    return {
      command: text.slice(0, gap.index),
      description: text.slice(gap.index + gap[0].length),
    };
  }
  const tokens = text.split(' ');
  let usageEnd = 1;
  while (
    usageEnd < tokens.length &&
    PLACEHOLDER_TOKEN_RE.test(tokens[usageEnd])
  )
    usageEnd++;
  return {
    command: tokens.slice(0, usageEnd).join(' '),
    description: tokens.slice(usageEnd).join(' '),
  };
};

const parseGroups = lines => {
  const groups = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (!line.startsWith(' ')) {
      groups.push({ title: line.trim(), entries: [] });
      continue;
    }
    const group = groups.at(-1);
    if (!group) continue;
    const indent = line.length - line.trimStart().length;
    const last = group.entries.at(-1);
    if (indent >= CONTINUATION_INDENT && last) {
      last.description += ` ${line.trim()}`;
      continue;
    }
    group.entries.push({ ...splitEntry(line.trim()), group: group.title });
  }
  return groups;
};

const matches = (entry, terms) => {
  const haystack =
    `${entry.command} ${entry.description} ${entry.group}`.toLowerCase();
  return terms.every(term => haystack.includes(term));
};

const MATCH_RANK = { EXACT: 0, PREFIX: 1, IN_NAME: 2, ELSEWHERE: 3 };

// Ranks by the first term against the command names (each alternative in
// "gco <ref> / gcob <new>"), so typing `gs` puts `gs` above `codexauto [args...]`.
const matchRank = (entry, term) => {
  const names = entry.command
    .toLowerCase()
    .split(' / ')
    .map(alternative => alternative.split(' ')[0]);
  if (names.includes(term)) return MATCH_RANK.EXACT;
  if (names.some(name => name.startsWith(term))) return MATCH_RANK.PREFIX;
  if (entry.command.toLowerCase().includes(term)) return MATCH_RANK.IN_NAME;
  return MATCH_RANK.ELSEWHERE;
};

const filterEntries = (groups, query) => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const all = groups.flatMap(group => group.entries);
  return all
    .filter(entry => matches(entry, terms))
    .map((entry, order) => ({ entry, order, rank: matchRank(entry, terms[0]) }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .map(({ entry }) => entry);
};

const truncate = (text, width) => {
  const chars = [...text];
  return chars.length > width ? `${chars.slice(0, width - 1).join('')}…` : text;
};

const createState = groups => ({
  groups,
  query: '',
  // null lists the groups; otherwise the index of the open group.
  openGroup: null,
  selected: 0,
  scroll: 0,
  status: '',
});

const currentRows = state => {
  if (state.query) {
    return filterEntries(state.groups, state.query).map(entry => ({
      kind: 'entry',
      entry,
      showGroup: true,
    }));
  }
  if (state.openGroup === null) {
    return state.groups.map((group, index) => ({
      kind: 'group',
      group,
      index,
    }));
  }
  return state.groups[state.openGroup].entries.map(entry => ({
    kind: 'entry',
    entry,
    showGroup: false,
  }));
};

const renderRow = (row, width) => {
  if (row.kind === 'group') {
    const count = `${row.group.entries.length}`;
    return `${ANSI.BOLD}${truncate(row.group.title, width - count.length - 3)}${ANSI.RESET} ${ANSI.DIM}${count} ›${ANSI.RESET}`;
  }
  const { command, description, group } = row.entry;
  const head = truncate(command, Math.floor(width / 2));
  // Filter results mix groups, so each one names its group.
  const rest = truncate(
    `${row.showGroup ? `${group} · ` : ''}${description}`,
    Math.max(width - [...head].length - 2, 0),
  );
  return `${ANSI.CYAN}${head}${ANSI.RESET}  ${ANSI.DIM}${rest}${ANSI.RESET}`;
};

const render = (state, title) => {
  // A pty without a size reports 0, not undefined.
  const columns = process.stdout.columns || DEFAULT_COLUMNS;
  const rows = process.stdout.rows || DEFAULT_ROWS;
  const width = columns - 2;
  const listRows = Math.max(rows - CHROME_ROWS, 1);
  const items = currentRows(state);
  state.selected = Math.min(state.selected, Math.max(items.length - 1, 0));
  if (state.selected < state.scroll) state.scroll = state.selected;
  if (state.selected >= state.scroll + listRows)
    state.scroll = state.selected - listRows + 1;

  const crumb =
    state.openGroup !== null && !state.query
      ? ` › ${state.groups[state.openGroup].title}`
      : '';
  const out = [
    `${ANSI.BOLD}${truncate(`${title}${crumb}`, width)}${ANSI.RESET}`,
    `${ANSI.CYAN}❯${ANSI.RESET} ${state.query}${ANSI.DIM}${state.query ? '' : ' type to filter'}${ANSI.RESET}`,
    '',
  ];
  const visible = items.slice(state.scroll, state.scroll + listRows);
  visible.forEach((row, offset) => {
    const line = renderRow(row, width);
    out.push(
      state.scroll + offset === state.selected
        ? `${ANSI.INVERSE}›${ANSI.RESET} ${line}`
        : `  ${line}`,
    );
  });
  if (!items.length) out.push(`  ${ANSI.DIM}No matches${ANSI.RESET}`);
  while (out.length < listRows + 3) out.push('');
  out.push(
    '',
    `${ANSI.DIM}${truncate(state.status || HELP, width)}${ANSI.RESET}`,
  );
  process.stdout.write(
    `${ANSI.HOME}${out.map(line => `${ANSI.CLEAR_LINE}${line}`).join('\n')}${ANSI.CLEAR_DOWN}`,
  );
};

// The line to prefill when a command needs input: the first of several
// alternatives ("gco <ref> / gcob <new>"), up to its first placeholder.
const prefillFor = command => {
  const first = command.split(' / ')[0];
  const tokens = first.split(' ');
  const literal = [];
  for (const token of tokens) {
    if (PLACEHOLDER_TOKEN_RE.test(token)) break;
    literal.push(token);
  }
  return `${literal.join(' ')} `;
};

const withPrefix = (prefix, command) =>
  prefix ? `${prefix} ${command}` : command;

const askForLine = (usage, prefill) =>
  new Promise(resolveLine => {
    process.stdout.write(`${ANSI.DIM}Usage: ${usage}${ANSI.RESET}\n`);
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.on('SIGINT', () => {
      rl.close();
      process.stdout.write('\n');
      process.exit(130);
    });
    rl.question(`${ANSI.CYAN}❯${ANSI.RESET} `, answer => {
      rl.close();
      resolveLine(answer.trim());
    });
    rl.write(prefill);
  });

const runLine = (line, { output }) => {
  if (output) {
    writeFileSync(output, line);
    return 0;
  }
  process.stdout.write(`${ANSI.DIM}$ ${line}${ANSI.RESET}\n`);
  const shell = process.env.SHELL || '/bin/sh';
  const { status } = spawnSync(shell, ['-c', line], {
    stdio: 'inherit',
    cwd: REPO_ROOT,
  });
  return status ?? 1;
};

const leaveScreen = () => {
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.stdout.write(`${ANSI.CURSOR_SHOW}${ANSI.ALT_SCREEN_OFF}`);
};

const pick = (groups, title) =>
  new Promise(resolvePick => {
    const state = createState(groups);
    const finish = entry => {
      process.stdin.off('data', onKey);
      process.stdout.off('resize', redraw);
      leaveScreen();
      process.stdin.pause();
      resolvePick(entry);
    };
    const redraw = () => render(state, title);
    const items = () => currentRows(state);
    const openGroup = index => {
      state.openGroup = index;
      state.selected = 0;
      state.scroll = 0;
    };

    const onKey = data => {
      const key = data.toString();
      state.status = '';
      const row = items()[state.selected];
      if (is(key, 'CTRL_C') || is(key, 'ESC')) return finish(null);
      if (is(key, 'UP')) state.selected = Math.max(state.selected - 1, 0);
      else if (is(key, 'DOWN'))
        state.selected = Math.min(state.selected + 1, items().length - 1);
      else if (is(key, 'RIGHT')) {
        if (!state.query && row?.kind === 'group') openGroup(row.index);
      } else if (is(key, 'LEFT')) {
        if (!state.query && state.openGroup !== null) {
          const back = state.openGroup;
          state.openGroup = null;
          state.selected = back;
          state.scroll = 0;
        }
      } else if (is(key, 'ENTER')) {
        if (row?.kind === 'group') openGroup(row.index);
        else if (row?.kind === 'entry') {
          if (row.entry.command.startsWith(INFO_ONLY_PREFIX)) {
            state.status = 'Not a command; it runs on its own.';
          } else return finish(row.entry);
        }
      } else if (is(key, 'BACKSPACE')) {
        state.query = [...state.query].slice(0, -1).join('');
        state.selected = 0;
      } else if (!key.startsWith('\x1b') && key >= ' ') {
        state.query += key;
        state.selected = 0;
      }
      redraw();
    };

    process.stdout.write(`${ANSI.ALT_SCREEN_ON}${ANSI.CURSOR_HIDE}`);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', onKey);
    process.stdout.on('resize', redraw);
    redraw();
  });

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const lines = readBlock(options.file);
  if (options.print || !process.stdout.isTTY || !process.stdin.isTTY) {
    process.stdout.write(`${lines.join('\n')}\n`);
    return;
  }
  process.on('exit', () => process.stdout.write(ANSI.CURSOR_SHOW));
  const groups = parseGroups(lines);
  const title = readFileSync(resolve(REPO_ROOT, options.file), 'utf8')
    .split('\n')[0]
    .replace(/^#\s*/, '');
  const entry = await pick(groups, title);
  if (!entry) return;
  const line = NEEDS_INPUT_RE.test(entry.command)
    ? await askForLine(
        withPrefix(options.prefix, entry.command),
        withPrefix(options.prefix, prefillFor(entry.command)),
      )
    : withPrefix(options.prefix, entry.command);
  if (!line) return;
  process.exitCode = runLine(line, options);
};

main().catch(error => {
  leaveScreen();
  console.error(error);
  process.exit(1);
});
