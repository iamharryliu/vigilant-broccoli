import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { generateResumePdfBuffer } from '@vigilant-broccoli/resume/server';
import { RESUME_PATH } from '../src/lib/paths.server';
import { readResume } from './skill-resume';

const [, , outputPath, inputPath] = process.argv;
const SOURCE_EXTENSION = /\.pdf$/i;

if (!outputPath) {
  console.error('Usage: generate-resume-pdf.cjs <output.pdf> [resume.json]');
  process.exit(1);
}

generateResumePdfBuffer(readResume(inputPath))
  .then(buffer => {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, buffer);
    // The app edits an application's resume from this copy and re-renders the
    // PDF with it, so a run keeps the tailored resume beside its PDF. A source
    // already at the twin path (an edit or a preview) needs no copy.
    const twinPath = outputPath.replace(SOURCE_EXTENSION, '.json');
    const sourcePath = inputPath ?? RESUME_PATH;
    if (resolve(sourcePath) !== resolve(twinPath))
      copyFileSync(sourcePath, twinPath);
    console.log(`Resume PDF written to ${outputPath}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
