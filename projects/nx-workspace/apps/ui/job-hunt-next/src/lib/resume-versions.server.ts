import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { CAREER_FILE, readCareerFile } from './career-files.server';
import { RESUME_VERSIONS_DIR } from './paths.server';

const FILE_ENCODING = 'utf-8';
const VERSION_EXTENSION = '.json';

export type ResumeVersion = {
  id: string;
  createdAt: string;
  content: string;
  // The master resume an application started from (v0).
  base?: boolean;
};

// Ids are zero-padded timestamps so a plain sort is chronological.
const newVersionId = () => String(Date.now()).padStart(16, '0');

const listVersions = async (dir: string): Promise<ResumeVersion[]> => {
  await mkdir(dir, { recursive: true });
  const names = (await readdir(dir))
    .filter(name => name.endsWith(VERSION_EXTENSION))
    .sort();
  return Promise.all(
    names.map(async name =>
      JSON.parse(await readFile(join(dir, name), FILE_ENCODING)),
    ),
  );
};

// Snapshots `content` into `dir` when it differs from the latest version, so
// edits made outside the editor (import runs, the skill, a reset) are
// captured the next time versions are read or saved.
export const syncVersions = async (
  dir: string,
  content: string,
  base?: boolean,
): Promise<ResumeVersion[]> => {
  const versions = await listVersions(dir);
  if (versions.at(-1)?.content === content) return versions;
  const version: ResumeVersion = {
    id: newVersionId(),
    createdAt: new Date().toISOString(),
    content,
    ...(base && { base }),
  };
  await writeFile(
    join(dir, `${version.id}${VERSION_EXTENSION}`),
    JSON.stringify(version),
    FILE_ENCODING,
  );
  return [...versions, version];
};

// Ids are millisecond timestamps, so the base must be written a tick before
// the tailored version that follows it.
export const seedBaseVersion = async (dir: string, content: string) => {
  if ((await listVersions(dir)).length) return;
  await syncVersions(dir, content, true);
  await new Promise(resolve => setTimeout(resolve, 2));
};

export const syncResumeVersions = async () =>
  syncVersions(RESUME_VERSIONS_DIR, await readCareerFile(CAREER_FILE.RESUME));
