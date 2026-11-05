import { execFile } from 'child_process';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';
import { PDF_SCRIPT } from './application-resume.server';
import { SKILL_WORKDIR } from './paths.server';

const FILE_ENCODING = 'utf-8';

const execFileAsync = promisify(execFile);

// Renders unsaved editor content through the same script that builds an
// application's PDF; it throws when the resume overflows one page.
export const renderResumePreview = async (content: string) => {
  const dir = await mkdtemp(join(tmpdir(), 'resume-preview-'));
  try {
    const sourcePath = join(dir, 'resume.json');
    const pdfPath = join(dir, 'resume.pdf');
    await writeFile(sourcePath, content, FILE_ENCODING);
    await execFileAsync(process.execPath, [PDF_SCRIPT, pdfPath, sourcePath], {
      cwd: SKILL_WORKDIR,
    });
    return await readFile(pdfPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};
