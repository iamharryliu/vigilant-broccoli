import { readFileSync } from 'node:fs';
import {
  isCareerFileKind,
  validateCareerFile,
} from '../src/app/utils/career-file.utils';

// Lets a career import run check its output against the same rules the app
// applies on save, and fix it before finishing.
const [kind, path] = process.argv.slice(2);
if (!isCareerFileKind(kind) || !path) {
  console.error(
    'Usage: validate-career-file.cjs <career-experience|resume> <file>',
  );
  process.exit(1);
}

const errors = validateCareerFile(kind, readFileSync(path, 'utf-8'));
if (errors.length) {
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log('OK');
