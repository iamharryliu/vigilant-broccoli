import { readFileSync } from 'node:fs';
import { ResumeData, validateResume } from '@vigilant-broccoli/resume';
import { RESUME_PATH } from '../src/lib/paths.server';

const FILE_ENCODING = 'utf-8';

// The scripts render the mounted resume, never the lib's bundled one. A
// missing location stays blank instead of taking the lib's owner default.
export const readResume = (path: string = RESUME_PATH): ResumeData => {
  const validation = validateResume(
    JSON.parse(readFileSync(path, FILE_ENCODING)),
  );
  if (!validation.ok) {
    console.error(`Invalid resume at ${path}:`, validation.errors);
    process.exit(1);
  }
  const { resume } = validation;
  return {
    ...resume,
    basics: { ...resume.basics, location: resume.basics.location ?? '' },
  };
};
