import {
  appendFileSync,
  copyFileSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { generateResumePdfBuffer } from '@vigilant-broccoli/resume/server';
import { RESUME_PATH, RUN_FILE } from '../src/lib/paths.server';
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
    // Tells the run which application folders are its own, for seeding their
    // base resume version when it ends.
    if (basename(sourcePath) === RUN_FILE.WORKING_RESUME) {
      appendFileSync(
        join(dirname(sourcePath), RUN_FILE.OUTPUTS),
        `${resolve(twinPath)}\n`,
      );
    }
    console.log(`Resume PDF written to ${outputPath}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
