import fs from 'fs';
import path from 'path';

const MD_EXT = '.md';
const NODE_TYPE_FILE = 'file';
const NODE_TYPE_DIRECTORY = 'directory';
const IGNORE = [/(^|\/)\.git(\/|$)/, /(^|\/)\.obsidian(\/|$)/, /__pycache__/];

const shouldIgnore = p => IGNORE.some(re => re.test(p));

const sort = nodes =>
  nodes
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === NODE_TYPE_DIRECTORY ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map(n => (n.children ? { ...n, children: sort(n.children) } : n));

const walk = (absDir, relDir, notesOut) => {
  const children = [];
  for (const entry of fs.readdirSync(absDir)) {
    const abs = path.join(absDir, entry);
    const rel = relDir ? `${relDir}/${entry}` : entry;
    if (shouldIgnore(abs)) continue;
    if (fs.statSync(abs).isDirectory()) {
      const sub = walk(abs, rel, notesOut);
      if (sub.length > 0) {
        children.push({
          name: entry,
          path: rel,
          type: NODE_TYPE_DIRECTORY,
          children: sub,
        });
      }
    } else if (entry.endsWith(MD_EXT)) {
      const dest = path.join(notesOut, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(abs, dest);
      children.push({ name: entry, path: rel, type: NODE_TYPE_FILE });
    }
  }
  return children;
};

const [, , sourceDir, outDir] = process.argv;
if (!sourceDir || !outDir) {
  console.error('Usage: node build-snapshot.mjs <sourceDir> <outDir>');
  process.exit(1);
}
if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`Invalid source directory: ${sourceDir}`);
  process.exit(1);
}

const notesOut = path.join(outDir, 'notes');
fs.rmSync(notesOut, { recursive: true, force: true });
fs.mkdirSync(notesOut, { recursive: true });

const tree = sort(walk(sourceDir, '', notesOut));
fs.writeFileSync(
  path.join(outDir, 'structure.json'),
  JSON.stringify(tree, null, 2),
);
console.log(`Wrote snapshot: ${notesOut} + structure.json`);
