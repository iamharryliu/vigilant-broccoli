// Git long-running filter (gitprotocol-common "process", version 2) for
// *.md, wired in .gitattributes and setup/dotfiles/.gitconfig. Clean compacts
// table padding so commits and PR diffs show only edited rows; smudge
// re-aligns tables with Prettier so the working tree matches format-on-save.
// One process serves a whole Git command, so Prettier loads once rather than
// per file.

import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compactMarkdownTables,
  hasMarkdownTable,
} from './md-table-compact.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PRETTIER_IGNORE_PATHS = ['.gitignore', '.prettierignore'].map(file =>
  join(REPO_ROOT, file),
);
const PACKET_HEADER_SIZE = 4;
const MAX_PACKET_DATA = 65516;
const FLUSH_PACKET = '0000';
const COMMAND = { CLEAN: 'clean', SMUDGE: 'smudge' };
const STATUS = { SUCCESS: 'status=success', ERROR: 'status=error' };

const createPacketReader = stream => {
  const chunks = stream[Symbol.asyncIterator]();
  let buffer = Buffer.alloc(0);
  const fill = async size => {
    while (buffer.length < size) {
      const { value, done } = await chunks.next();
      if (done) return false;
      buffer = Buffer.concat([buffer, value]);
    }
    return true;
  };
  // Resolves to a data Buffer, null for a flush packet, or undefined at EOF.
  return async () => {
    if (!(await fill(PACKET_HEADER_SIZE))) return undefined;
    const length = parseInt(
      buffer.subarray(0, PACKET_HEADER_SIZE).toString('ascii'),
      16,
    );
    if (length === 0) {
      buffer = buffer.subarray(PACKET_HEADER_SIZE);
      return null;
    }
    if (!(await fill(length))) throw new Error('Truncated pkt-line');
    const data = buffer.subarray(PACKET_HEADER_SIZE, length);
    buffer = buffer.subarray(length);
    return data;
  };
};

const readPacket = createPacketReader(process.stdin);

const readTextList = async () => {
  const lines = [];
  for (;;) {
    const packet = await readPacket();
    if (packet === undefined) return lines.length ? lines : undefined;
    if (packet === null) return lines;
    lines.push(packet.toString('utf8').replace(/\n$/, ''));
  }
};

const readContent = async () => {
  const parts = [];
  for (;;) {
    const packet = await readPacket();
    if (packet === undefined) throw new Error('Unexpected EOF in content');
    if (packet === null) return Buffer.concat(parts);
    parts.push(packet);
  }
};

const encodePacket = data =>
  Buffer.concat([
    Buffer.from(
      (data.length + PACKET_HEADER_SIZE).toString(16).padStart(4, '0'),
    ),
    data,
  ]);

const writeTextList = lines =>
  process.stdout.write(
    Buffer.concat([
      ...lines.map(line => encodePacket(Buffer.from(`${line}\n`))),
      Buffer.from(FLUSH_PACKET),
    ]),
  );

const writeContent = content => {
  const packets = [];
  for (let start = 0; start < content.length; start += MAX_PACKET_DATA) {
    packets.push(
      encodePacket(content.subarray(start, start + MAX_PACKET_DATA)),
    );
  }
  process.stdout.write(Buffer.concat([...packets, Buffer.from(FLUSH_PACKET)]));
};

let prettierModule;
// Resolved from the repo root so the filter uses the workspace's pinned
// Prettier; without node_modules, smudge leaves files compact.
const loadPrettier = () => {
  if (prettierModule === undefined) {
    try {
      prettierModule = createRequire(join(REPO_ROOT, 'package.json'))(
        'prettier',
      );
    } catch {
      prettierModule = null;
    }
  }
  return prettierModule;
};

// Smudge must never introduce a change clean cannot undo, or Git would report
// a freshly checked out file as modified, so anything Prettier changes
// besides table padding makes it keep the committed text.
const alignTables = async (text, pathname) => {
  if (!hasMarkdownTable(text)) return text;
  const prettier = loadPrettier();
  if (!prettier) return text;
  const filepath = join(REPO_ROOT, pathname);
  try {
    const { ignored } = await prettier.getFileInfo(filepath, {
      ignorePath: PRETTIER_IGNORE_PATHS,
    });
    if (ignored) return text;
    const options = await prettier.resolveConfig(filepath);
    const formatted = await prettier.format(text, { ...options, filepath });
    return compactMarkdownTables(formatted) === compactMarkdownTables(text)
      ? formatted
      : text;
  } catch {
    return text;
  }
};

const transform = async (command, pathname, content) => {
  const text = content.toString('utf8');
  if (command === COMMAND.CLEAN) return compactMarkdownTables(text);
  if (command === COMMAND.SMUDGE) return alignTables(text, pathname);
  throw new Error(`Unsupported command ${command}`);
};

const headerValue = (headers, key) =>
  headers.find(header => header.startsWith(`${key}=`))?.slice(key.length + 1);

const handshake = async () => {
  const welcome = await readTextList();
  if (welcome?.[0] !== 'git-filter-client' || !welcome.includes('version=2')) {
    throw new Error('Unsupported filter protocol');
  }
  writeTextList(['git-filter-server', 'version=2']);
  const offered = await readTextList();
  writeTextList(
    Object.values(COMMAND)
      .map(command => `capability=${command}`)
      .filter(capability => offered?.includes(capability)),
  );
};

const serve = async () => {
  await handshake();
  for (;;) {
    const headers = await readTextList();
    if (headers === undefined) return;
    const content = await readContent();
    try {
      const result = await transform(
        headerValue(headers, 'command'),
        headerValue(headers, 'pathname') ?? '',
        content,
      );
      writeTextList([STATUS.SUCCESS]);
      writeContent(Buffer.from(result, 'utf8'));
      writeTextList([]);
    } catch {
      writeTextList([STATUS.ERROR]);
    }
  }
};

await serve();
