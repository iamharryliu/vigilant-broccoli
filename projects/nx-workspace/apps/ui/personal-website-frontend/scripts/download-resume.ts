import * as fs from 'fs';
import * as path from 'path';
import { fetchResumePdfBuffer } from '../../../../scripts/resume.ts';

const OUTPUT_PATH = path.resolve(
  'apps/ui/personal-website-frontend/src/assets/resume.pdf',
);

fetchResumePdfBuffer()
  .then(buffer => {
    fs.writeFileSync(OUTPUT_PATH, buffer);
    console.log(`Resume PDF downloaded to ${OUTPUT_PATH}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
