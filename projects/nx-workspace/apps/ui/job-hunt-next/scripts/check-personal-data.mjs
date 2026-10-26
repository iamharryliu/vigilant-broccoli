// Fails the image build if the owner's email or phone from the resume lib's
// resume.json made it into the build output the Dockerfile copies. The build
// swaps that file for templates/resume.json (see CONTEXT.md); this catches a
// new import or tracing change that brings it back before the image is pushed.
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORKSPACE_DIR = resolve(APP_DIR, '../../..');
const OWNER_RESUME = join(
  WORKSPACE_DIR,
  'libs/@vigilant-broccoli/resume/src/resume.json',
);
const SCANNED_DIRS = [
  join(WORKSPACE_DIR, 'dist/apps/ui/job-hunt-next/.next/standalone'),
  join(WORKSPACE_DIR, 'dist/apps/ui/job-hunt-next/.next/static'),
  join(WORKSPACE_DIR, 'dist/apps/ui/job-hunt-next/skill-workdir'),
  join(APP_DIR, 'templates'),
];

const listFiles = async dir =>
  (await readdir(dir, { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile())
    .map(entry => join(entry.parentPath, entry.name));

const { email, phone } = JSON.parse(
  await readFile(OWNER_RESUME, 'utf-8'),
).basics;
const needles = [email, phone].filter(Boolean).map(value => Buffer.from(value));

const leaks = [];
for (const dir of SCANNED_DIRS) {
  for (const file of await listFiles(dir)) {
    const content = await readFile(file);
    if (needles.some(needle => content.includes(needle))) leaks.push(file);
  }
}

if (leaks.length) {
  console.error("The owner's email or phone is in the image's build output:");
  leaks.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}
console.log(`No owner contact details in ${SCANNED_DIRS.length} image paths.`);
