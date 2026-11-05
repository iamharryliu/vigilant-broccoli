import { execFile } from 'child_process';
import { createHash } from 'crypto';
import { access, readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';
import {
  APPLICATION_FILE,
  findApplicationFile,
} from '../app/utils/job-application-files.utils';
import { findApplicationResume } from './application-resume.server';
import {
  APPLICATION_COVER_LETTER_VERSIONS_DIR,
  resolveJobApplicationsPath,
  SKILL_WORKDIR,
} from './paths.server';
import { syncVersions } from './resume-versions.server';

const FILE_ENCODING = 'utf-8';
const PDF_SCRIPT = join('skill-scripts', 'generate-cover-letter-pdf.cjs');

const execFileAsync = promisify(execFile);

export type ApplicationCoverLetter = {
  folder: string;
  sourcePath: string;
  pdfName: string;
  pdfPath: string;
  versionsDir: string;
};

export const findApplicationCoverLetter = async (
  folder: string,
): Promise<ApplicationCoverLetter | null> => {
  const folderPath = resolveJobApplicationsPath(folder);
  if (!folderPath || !folder) return null;
  const names = await readdir(folderPath).catch(() => []);
  const source = findApplicationFile(
    names.map(name => ({ name })),
    APPLICATION_FILE.COVER_LETTER_TEXT,
  );
  if (!source) return null;
  const pdfName = source.name.replace(/\.txt$/, '.pdf');
  return {
    folder,
    sourcePath: join(folderPath, source.name),
    pdfName,
    pdfPath: join(folderPath, pdfName),
    versionsDir: join(
      APPLICATION_COVER_LETTER_VERSIONS_DIR,
      createHash('sha1').update(folder).digest('hex'),
    ),
  };
};

// `pdf` is the root-relative path the file route serves, null when the PDF
// was never generated.
export const readApplicationCoverLetter = async (
  letter: ApplicationCoverLetter,
) => {
  const content = await readFile(letter.sourcePath, FILE_ENCODING);
  const hasPdf = await access(letter.pdfPath).then(
    () => true,
    () => false,
  );
  return {
    content,
    versions: await syncVersions(letter.versionsDir, content),
    pdf: hasPdf ? `${letter.folder}/${letter.pdfName}` : null,
  };
};

// The letter's header title follows the tailored resume of the same
// application, as the skill does when it first writes the PDF.
const tailoredTitle = async (folder: string) => {
  const resume = await findApplicationResume(folder);
  if (!resume) return [];
  try {
    const { basics } = JSON.parse(
      await readFile(resume.sourcePath, FILE_ENCODING),
    );
    return basics?.title ? [basics.title] : [];
  } catch {
    return [];
  }
};

// Saves the edit as a new version and re-renders the PDF from it; the PDF is
// reported separately because rendering needs the skill workdir's Playwright
// and fails when the letter exceeds one page.
export const writeApplicationCoverLetter = async (
  letter: ApplicationCoverLetter,
  content: string,
) => {
  await readApplicationCoverLetter(letter);
  await writeFile(letter.sourcePath, content, FILE_ENCODING);
  const versions = await syncVersions(letter.versionsDir, content);
  const pdfUpdated = await execFileAsync(
    process.execPath,
    [
      PDF_SCRIPT,
      letter.sourcePath,
      letter.pdfPath,
      ...(await tailoredTitle(letter.folder)),
    ],
    { cwd: SKILL_WORKDIR },
  ).then(
    () => true,
    () => false,
  );
  return { versions, pdfUpdated };
};
