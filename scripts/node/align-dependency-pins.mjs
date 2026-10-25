#!/usr/bin/env node
// Aligns app/lib dependency ranges with the nx-workspace root, per the root
// CONTEXT.md rule: a dependency already declared in the root must mirror its
// range, never "*" or a divergent pin.
//
//   node scripts/node/align-dependency-pins.mjs [--check] [--report <file>]
//
// Default mode edits package.json files; --check only reports. Either way a
// clean run exits 0 and prints DRIFT_CLEAN. Candidates needing judgment (a
// different major, or a range that would move below what the package declares)
// are skipped and listed, never edited.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const NX_WORKSPACE = join(REPO_ROOT, 'projects/nx-workspace');
const ROOT_PACKAGE = 'package.json';
const WORKSPACE_FILE = join(NX_WORKSPACE, 'pnpm-workspace.yaml');
// peerDependencies stay wide on purpose, so they are not audited.
const SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies'];
const NON_REGISTRY_SPEC = /^(workspace|file|link|npm|git|github|https?):/;
// Keeps one run reviewable; the rest is picked up by the next weekly run.
const MAX_EDITS = 40;

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const reportIndex = args.indexOf('--report');
const reportPath = reportIndex === -1 ? null : args[reportIndex + 1];

const readJson = path => JSON.parse(readFileSync(path, 'utf8'));

const globToRegExp = glob =>
  new RegExp(
    `^${glob
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '\0')
      .replace(/\*/g, '[^/]*')
      .replace(/\0/g, '.*')}$`,
  );

const workspacePatterns = readFileSync(WORKSPACE_FILE, 'utf8')
  .split('\n')
  .map(line => line.match(/^\s+-\s+'([^']+)'\s*$/)?.[1])
  .filter(Boolean)
  .map(globToRegExp);

const numbers = spec =>
  (spec.match(/\d+(\.\d+){0,2}/)?.[0] ?? '').split('.').map(Number);

const compareVersions = (a, b) => {
  for (let i = 0; i < 3; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff) return diff;
  }
  return 0;
};

const rootPackage = readJson(join(NX_WORKSPACE, ROOT_PACKAGE));

const rootRange = (name, section) =>
  rootPackage[section]?.[name] ??
  rootPackage.dependencies?.[name] ??
  rootPackage.devDependencies?.[name];

const memberManifests = execFileSync(
  'git',
  ['ls-files', '--', '*package.json'],
  { cwd: NX_WORKSPACE, encoding: 'utf8' },
)
  .split('\n')
  .filter(file => file && file !== ROOT_PACKAGE)
  .filter(file =>
    workspacePatterns.some(pattern => pattern.test(dirname(file))),
  );

const edits = [];
const skipped = [];

for (const file of memberManifests) {
  const manifest = readJson(join(NX_WORKSPACE, file));
  for (const section of SECTIONS) {
    for (const [name, spec] of Object.entries(manifest[section] ?? {})) {
      const target = rootRange(name, section);
      if (!target || spec === target || NON_REGISTRY_SPEC.test(spec)) continue;
      const candidate = { file, section, name, from: spec, to: target };
      if (spec === '*') {
        edits.push(candidate);
        continue;
      }
      const [currentMajor] = numbers(spec);
      const [targetMajor] = numbers(target);
      if (currentMajor !== targetMajor) {
        skipped.push({ ...candidate, reason: 'different major version' });
      } else if (compareVersions(numbers(target), numbers(spec)) < 0) {
        skipped.push({
          ...candidate,
          reason: 'root range is lower than the declared one',
        });
      } else {
        edits.push(candidate);
      }
    }
  }
}

const applied = edits.slice(0, MAX_EDITS);
const deferred = edits.slice(MAX_EDITS);

if (!checkOnly) {
  const byFile = Map.groupBy(applied, edit => edit.file);
  for (const [file, fileEdits] of byFile) {
    const path = join(NX_WORKSPACE, file);
    let text = readFileSync(path, 'utf8');
    for (const { section, name, from, to } of fileEdits) {
      const block = new RegExp(`"${section}"\\s*:\\s*\\{[^}]*\\}`);
      const entry = new RegExp(
        `("${name.replace(/[/@.]/g, '\\$&')}"\\s*:\\s*)"${from.replace(/[.^~*]/g, '\\$&')}"`,
      );
      text = text.replace(block, match => match.replace(entry, `$1"${to}"`));
    }
    writeFileSync(path, text);
  }
}

const line = ({ file, section, name, from, to, reason }) =>
  `- \`${file}\` ${section} \`${name}\`: \`${from}\` -> \`${to}\`${reason ? ` (${reason})` : ''}`;

const report = [
  `### ${checkOnly ? 'Drifted' : 'Aligned'} (${applied.length})`,
  ...applied.map(line),
  ...(deferred.length
    ? [
        '',
        `### Deferred to the next run (${deferred.length}, over the ${MAX_EDITS}-edit cap)`,
        ...deferred.map(line),
      ]
    : []),
  ...(skipped.length
    ? [
        '',
        `### Skipped, needs judgment (${skipped.length})`,
        ...skipped.map(line),
      ]
    : []),
].join('\n');

console.log(report);
if (reportPath) writeFileSync(reportPath, `${report}\n`);

if (!edits.length) console.log('\nDRIFT_CLEAN: no alignable pin drift.');
