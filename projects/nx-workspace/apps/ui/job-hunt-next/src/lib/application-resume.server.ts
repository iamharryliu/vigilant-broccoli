import { execFile } from 'child_process';
import { createHash } from 'crypto';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';
import {
  APPLICATION_FILE,
  findApplicationFile,
} from '../app/utils/job-application-files.utils';
import {
  APPLICATION_RESUME_VERSIONS_DIR,
  resolveJobApplicationsPath,
  SKILL_WORKDIR,
} from './paths.server';
import { seedBaseVersion, syncVersions } from './resume-versions.server';

const FILE_ENCODING = 'utf-8';
export const PDF_SCRIPT = join('skill-scripts', 'generate-resume-pdf.cjs');

const execFileAsync = promisify(execFile);

export type ApplicationResume = {
  sourcePath: string;
  pdfPath: string;
  versionsDir: string;
};

// Applications generated before the skill saved a `.json` twin have none.
export const findApplicationResume = async (
  folder: string,
): Promise<ApplicationResume | null> => {
  const folderPath = resolveJobApplicationsPath(folder);
  if (!folderPath || !folder) return null;
  const names = await readdir(folderPath).catch(() => []);
  const source = findApplicationFile(
    names.map(name => ({ name })),
    APPLICATION_FILE.RESUME_SOURCE,
  );
  if (!source) return null;
  return {
    sourcePath: join(folderPath, source.name),
    pdfPath: join(folderPath, source.name.replace(/\.json$/, '.pdf')),
    versionsDir: join(
      APPLICATION_RESUME_VERSIONS_DIR,
      createHash('sha1').update(folder).digest('hex'),
    ),
  };
};

export const readApplicationResume = async (resume: ApplicationResume) => {
  const content = await readFile(resume.sourcePath, FILE_ENCODING);
  return { content, versions: await syncVersions(resume.versionsDir, content) };
};

// Records the master resume a finished run started from as v0 of every
// application it produced, so History can diff the tailoring against it.
export const seedApplicationBaseVersions = async (
  baseContent: string,
  folders: string[],
) => {
  for (const folder of folders) {
    const resume = await findApplicationResume(folder);
    if (!resume) continue;
    await seedBaseVersion(resume.versionsDir, baseContent);
    await readApplicationResume(resume);
  }
};

// Saves the edit as a new version and re-renders the PDF from it; the PDF is
// reported separately because rendering needs the skill workdir's Playwright.
export const writeApplicationResume = async (
  resume: ApplicationResume,
  content: string,
) => {
  await readApplicationResume(resume);
  await writeFile(resume.sourcePath, content, FILE_ENCODING);
  const versions = await syncVersions(resume.versionsDir, content);
  const pdfUpdated = await execFileAsync(
    process.execPath,
    [PDF_SCRIPT, resume.pdfPath, resume.sourcePath],
    { cwd: SKILL_WORKDIR },
  ).then(
    () => true,
    () => false,
  );
  return { versions, pdfUpdated };
};
